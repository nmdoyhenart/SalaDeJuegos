export interface Carta {
  valor: number;    // Para comparar (1 a 13)
  mostrar: string;  // Para imprimir (A, 2, 3... J, Q, K)
  palo: string;     // ♥, ♦, ♣, ♠
  color: string;    // 'red' o 'black'
}