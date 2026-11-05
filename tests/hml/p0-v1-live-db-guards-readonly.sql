\set ON_ERROR_STOP on
\echo 'ContaOS P0 V1: configuracao real HML, somente leitura e rollback.'

BEGIN TRANSACTION READ ONLY;
SET LOCAL statement_timeout = '12000ms';
DO $audit$
DECLARE
  total_definer int;
  total_authorized int;
  anon_accessible int;
  wrong_search_path int;
  tables_without_rls int;
  private_bucket_count int;
  invoker_views int;
BEGIN
  SELECT count(*),
         count(*) FILTER (WHERE has_function_privilege('authenticated',p.oid,'EXECUTE')),
         count(*) FILTER (WHERE has_function_privilege('anon',p.oid,'EXECUTE'))
    INTO total_definer,total_authorized,anon_accessible
    FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
   WHERE n.nspname='public' AND p.prosecdef;
  IF total_definer <> 32 OR total_authorized <> 9 OR anon_accessible <> 0 THEN
    RAISE EXCEPTION 'HML_DEFINER_ACL_REGRESSION total=%,authenticated=%,anon=%',
       total_definer,total_authorized,anon_accessible;
  END IF;

  SELECT count(*) INTO wrong_search_path
    FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
   WHERE n.nspname='public' AND p.prosecdef
     AND has_function_privilege('authenticated',p.oid,'EXECUTE')
     AND NOT ('search_path=' = ANY(coalesce(p.proconfig,ARRAY[]::text[])));
  IF wrong_search_path > 0 THEN
    RAISE EXCEPTION 'HML_RPC_SEARCH_PATH_NOT_PINNED count=%',wrong_search_path;
  END IF;
  SELECT count(*) INTO tables_without_rls
    FROM pg_tables WHERE schemaname IN ('public','storage') AND rowsecurity=false;
  IF tables_without_rls <> 0 THEN
    RAISE EXCEPTION 'HML_RLS_MISSING_TABLES=%',tables_without_rls;
  END IF;
  SELECT count(*) INTO private_bucket_count
    FROM storage.buckets WHERE id='contaos-documentos' AND public=false;
  IF private_bucket_count <> 1 THEN
    RAISE EXCEPTION 'HML_DOCUMENT_BUCKET_NOT_PRIVATE';
  END IF;
  SELECT count(*) INTO invoker_views
    FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
   WHERE n.nspname='public' AND c.relkind='v'
     AND c.relname='v_central_excecoes_financeiras'
     AND 'security_invoker=true'=ANY(coalesce(c.reloptions,ARRAY[]::text[]));
  IF invoker_views <> 1 THEN
    RAISE EXCEPTION 'HML_FINANCE_VIEW_NOT_SECURITY_INVOKER';
  END IF;
  RAISE NOTICE 'PASS HML: 32 SECDEF, 9 authenticated, 0 anon, search_path fixed, RLS public/storage, bucket private and security_invoker';
END $audit$;
ROLLBACK;

BEGIN TRANSACTION READ ONLY;
SET LOCAL statement_timeout = '12000ms';
SET LOCAL ROLE anon;
DO $acl$
DECLARE
  stmt text;
  passed int := 0;
  statements text[] := ARRAY[
    'SELECT public.adicionar_versao_documento_competencia_v115(NULL::uuid,NULL::uuid,NULL::text,NULL::text)',
    'SELECT public.criar_documento_competencia_v115(NULL::uuid,NULL::text,NULL::text,NULL::text,NULL::uuid,NULL::uuid,NULL::text)',
    'SELECT public.enfileirar_ingestao_historica_hml(NULL::uuid,NULL::uuid)',
    'SELECT public.obter_analise_competencia_v116(NULL::uuid,NULL::integer,NULL::integer,NULL::integer,NULL::integer,NULL::integer,NULL::integer,NULL::text,NULL::text,NULL::text,NULL::text,NULL::text)',
    'SELECT public.obter_detalhe_requisito_v117(NULL::uuid,NULL::uuid,NULL::integer,NULL::integer,NULL::integer,NULL::integer,NULL::integer,NULL::integer)',
    'SELECT public.obter_documentos_competencia_v115(NULL::uuid,NULL::integer,NULL::integer,NULL::integer,NULL::integer)',
    'SELECT public.obter_visao_geral_competencia(NULL::uuid)',
    'SELECT public.registrar_relatorio_historico_hml(NULL::uuid,NULL::date,NULL::text)',
    'SELECT public.vincular_tratamento_historico_hml(NULL::uuid,NULL::text,NULL::text,NULL::text)'
  ];
BEGIN
  IF current_user <> 'anon' THEN
    RAISE EXCEPTION 'HML_ROLE_NOT_ANON';
  END IF;
  FOREACH stmt IN ARRAY statements LOOP
    BEGIN
      EXECUTE stmt;
      RAISE EXCEPTION 'ANON_RPC_EXECUTED_UNEXPECTEDLY';
    EXCEPTION WHEN insufficient_privilege THEN
      passed := passed + 1;
    END;
  END LOOP;
  IF passed <> 9 THEN
    RAISE EXCEPTION 'HML_ANON_NEGATIVE_RPC_COUNT=%',passed;
  END IF;
  RAISE NOTICE 'PASS HML: 9/9 live SQL RPC calls denied for anon (42501); no mutation';
END $acl$;
ROLLBACK;

BEGIN TRANSACTION READ ONLY;
SET LOCAL statement_timeout = '12000ms';
SET LOCAL ROLE authenticated;
DO $session$
BEGIN
  IF current_user <> 'authenticated' THEN
    RAISE EXCEPTION 'HML_ROLE_NOT_AUTHENTICATED';
  END IF;
  IF auth.uid() IS NOT NULL THEN
    RAISE EXCEPTION 'HML_UNEXPECTED_USER_CLAIM';
  END IF;
  RAISE NOTICE 'PASS HML: authenticated database role WITHOUT JWT has no auth.uid(); not a valid Auth session';
END $session$;
ROLLBACK;
\echo 'P0_V1_DB_HML_REAL_READONLY_PASS: catalog, 9 anon denials, missing JWT correctly distinguished'
