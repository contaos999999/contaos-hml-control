/**
 * Registro de executores CODE F3.
 *
 * Este arquivo NÃO contém mocks de sucesso. Cada driver registrado deve executar
 * a operação real em uma fixture isolada, devolver resultado de rede/readback
 * observável e lançar falha quando os resultados não correspondem ao contrato.
 *
 * Registrar:
 * producerDrivers[producerOrder] = async (case) => ({
 *   state: "UI_OBSERVED_NOT_CERTIFIED",
 *   organizationId: UUID real da fixture,
 *   producerEntityId: UUID da operação observada,
 * });
 *
 * consumerDrivers[consumer] e negativeDrivers[consumer] devem devolver observações
 * derivadas de testes efetivamente executados, com IDs de teste e asserções reais.
 * A assinatura do contrato encontra-se em createF3CodeCaseRuntime.
 *
 * Nenhum driver deve fabricar eventos nem retornar PASS sem executar o consumidor.
 * A certificação independente não é de responsabilidade deste registro.
 */
export const producerDrivers = Object.freeze(Object.create(null));
export const consumerDrivers = Object.freeze(Object.create(null));
export const negativeDrivers = Object.freeze(Object.create(null));

/** Na ausência de uma implementação independente auditada, recusar aprovação. */
export async function independentVerifier() {
  return false;
}
