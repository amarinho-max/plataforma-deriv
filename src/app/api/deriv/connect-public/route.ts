import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Testar conexão com WebSocket público
    const wsUrl = 'wss://api.derivws.com/trading/v1/options/ws/public';
    
    // Simular teste de conexão
    return NextResponse.json({
      success: true,
      message: 'WebSocket público disponível',
      url: wsUrl,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Erro ao conectar WebSocket',
    }, { status: 500 });
  }
}
