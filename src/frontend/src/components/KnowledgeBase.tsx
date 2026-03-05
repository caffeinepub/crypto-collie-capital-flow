import { useState, useMemo } from 'react';
import { Search, BookOpen, Clock, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface Chapter {
  id: number;
  title: string;
  readTime: number;
  content: Array<{ heading?: string; text: string }>;
}

const CHAPTERS: Chapter[] = [
  {
    id: 1,
    title: 'Introdução ao Smart Money Concept',
    readTime: 8,
    content: [
      { text: 'O Smart Money Concept (SMC) é uma abordagem de análise técnica que estuda o comportamento dos grandes players institucionais — bancos, fundos de hedge e market makers — no mercado financeiro. A premissa central é que esses participantes, devido ao seu volume massivo, deixam rastros identificáveis no gráfico de preços.' },
      { heading: 'Por que institucional?', text: 'Instituições não podem entrar e sair do mercado como traders de varejo. Uma posição de $500M em BTC requer acumulação gradual em múltiplas zonas de preço, criando estruturas específicas que o SMC aprende a reconhecer. Estas estruturas, quando identificadas corretamente, oferecem ao trader de varejo uma vantagem assimétrica significativa.' },
      { heading: 'Os três pilares do SMC', text: 'O SMC se fundamenta em três pilares: Estrutura de Mercado (identificar a direção do smart money), Pontos de Interesse (onde os institucionais colocam ordens), e Confluência (combinar múltiplos fatores para aumentar a probabilidade do trade).' },
      { text: 'Ao contrário da análise técnica tradicional baseada em indicadores lagging, o SMC trabalha com price action puro, lendo diretamente a intenção dos grandes players através de padrões de preço, volume e liquidez. Esta abordagem tem se popularizado enormemente na comunidade de trading em cripto devido à alta presença institucional no mercado.' },
    ],
  },
  {
    id: 2,
    title: 'Estrutura de Mercado e CHOCH',
    readTime: 10,
    content: [
      { text: 'A estrutura de mercado é o fundamento de toda análise SMC. Entender se o mercado está em tendência de alta (Higher Highs e Higher Lows) ou tendência de baixa (Lower Lows e Lower Highs) define a direção em que você deve procurar trades.' },
      { heading: 'Change of Character (CHOCH)', text: 'O CHOCH ocorre quando o preço quebra a estrutura vigente de uma forma que sugere uma mudança de controle entre compradores e vendedores. Em uma tendência de alta, o CHOCH é confirmado quando o preço quebra abaixo do último Higher Low significativo. O sinal antecipado de CHOCH frequentemente precede movimentos expressivos de 10-30%.' },
      { heading: 'Break of Structure (BOS)', text: 'Diferente do CHOCH, o BOS é uma continuação da tendência existente. Quando o preço quebra acima de um Higher High em tendência de alta, temos um BOS — confirmação de que a tendência continua. Saber distinguir CHOCH de BOS é crucial para não entrar contra a tendência institucional.' },
      { text: 'A chave para identificar estruturas válidas está no timeframe. Estruturas formadas no gráfico de 4h ou diário têm mais peso do que as do 15m. Um CHOCH no diário pode representar uma oportunidade de swing de semanas, enquanto um CHOCH no 15m pode ser ruído de mercado.' },
    ],
  },
  {
    id: 3,
    title: 'Order Blocks Institucionais',
    readTime: 12,
    content: [
      { text: 'Order Blocks (OB) são regiões do gráfico onde os institucionais colocaram grandes ordens que causaram movimentos explosivos de preço. Estas zonas funcionam como ímãs de preço — o mercado tende a retornar a elas para "mitigar" as ordens deixadas para trás antes de continuar o movimento original.' },
      { heading: 'Identificando um Order Block válido', text: 'Um Order Block Bullish é formado pela última vela de baixa antes de um movimento de alta agressivo (tipicamente 3x o tamanho médio das velas anteriores). Um OB Bearish é a última vela de alta antes de um crash. A validade aumenta quando o OB está alinhado com outros fatores de confluência como FVGs, zonas de liquidez e estrutura de mercado.' },
      { heading: 'Breaker Blocks', text: 'Quando um Order Block é violado (o preço o atravessa e continua na mesma direção), ele se transforma em Breaker Block — uma inversão de polaridade onde o que era suporte vira resistência e vice-versa. Breaker Blocks são igualmente poderosos para operações de reversão.' },
      { text: 'No mercado de cripto, Order Blocks em timeframes superiores (4h, diário) são especialmente eficazes devido à presença crescente de market makers institucionais que usam algoritmos para acumular posições nessas zonas. Fundos como o de Michael Saylor e outros whales deixam OBs extremamente precisos.' },
    ],
  },
  {
    id: 4,
    title: 'Fair Value Gaps (FVG)',
    readTime: 9,
    content: [
      { text: 'Fair Value Gaps (FVG), também conhecidos como Imbalances, são desequilíbrios de preço criados quando o mercado se move tão rapidamente que "pula" uma faixa de preço sem negociação bilateral. Tecnicamente, são identificados quando a sombra superior da primeira vela não se sobrepõe à sombra inferior da terceira vela (ou vice-versa).' },
      { heading: 'A lógica por trás dos FVGs', text: 'O mercado tende ao equilíbrio. Quando um FVG é criado, especialmente em movimentos institucionais, o preço frequentemente retorna para "preencher" esse gap antes de continuar na direção original. Esta característica pode ser explorada para entradas em pullback de alta probabilidade.' },
      { heading: 'FVG vs Order Block', text: 'FVGs e OBs frequentemente se sobrepõem, criando zonas de confluência extremamente poderosas. A diferença principal é que o OB representa onde as ordens institucionais foram colocadas, enquanto o FVG representa o espaço de desequilíbrio deixado pela urgência com que essas ordens foram executadas.' },
      { text: 'Em cripto, FVGs aparecem com frequência em movimentos de pump e dump. Identificar FVGs não preenchidos em níveis estratégicos pode antecipar zonas de suporte/resistência significativas semanas antes do preço chegar a esses níveis.' },
    ],
  },
  {
    id: 5,
    title: 'Zonas de Liquidez',
    readTime: 11,
    content: [
      { text: 'Liquidez no contexto do SMC refere-se a clusters de ordens stop loss de outros traders. Os institucionais precisam dessas ordens como contraparte para suas próprias posições. Por isso, o mercado é frequentemente manipulado para "buscar" essa liquidez antes de mover na direção real.' },
      { heading: 'Onde fica a liquidez?', text: 'Liquidez se acumula em locais óbvios: acima de topos anteriores (buy stops de shorts e stops de longs que foram rompidos), abaixo de fundos (sell stops de longs), em níveis psicológicos redondos ($50.000, $100.000) e em linhas de tendência muito seguidas. Quanto mais "óbvio" o nível, mais liquidez existe nele.' },
      { heading: 'Equal Highs/Lows (EQH/EQL)', text: 'Duplos topos e fundos são particularmente ricos em liquidez. Traders convencionais colocam stops logo abaixo de um fundo duplo ou acima de um topo duplo. Os institucionais frequentemente "varrem" essa liquidez com um spike rápido antes de reverter violentamente — este é o padrão de "Stop Hunt" ou "Liquidity Grab".' },
      { text: 'A estratégia mais eficaz com zonas de liquidez é aguardar a varredura (o spike que atravessa o nível) seguida de um fechamento de vela de volta para dentro da zona. Isso confirma que a liquidez foi absorvida e o movimento real está prestes a começar.' },
    ],
  },
  {
    id: 6,
    title: 'Manipulação de Mercado',
    readTime: 13,
    content: [
      { text: 'A manipulação de mercado, no contexto do SMC, não se refere a práticas ilegais, mas sim às táticas legítimas que grandes players usam para construir posições ao melhor preço possível. Entender esses padrões é essencial para não ser o lado oposto das operações institucionais.' },
      { heading: 'O ciclo de acumulação-manipulação-distribuição', text: 'Os mercados seguem um ciclo previsível: Acumulação (instituições compram silenciosamente em range lateral), Manipulação (spike falso de baixa para capturar stops e liquidez), Distribuição Bullish (movimento real de alta), Reacumulação (consolidação em níveis mais altos), e repetição. Identificar em qual fase do ciclo o mercado está é o Santo Graal do trading institucional.' },
      { heading: 'Padrões de manipulação em cripto', text: 'O mercado de futuros de cripto é especialmente vulnerável a manipulações orquestradas. Os padrões mais comuns incluem: Flash Crash antes de pump, Stop Hunt falso para cima antes de dump, Fake breakout de consolidação longa, e Wicks extremos em liquidações em cascata.' },
      { text: 'A proteção contra manipulação é simples na teoria: nunca coloque stops em locais óbvios. Use buffers além dos níveis psicológicos e estruturais. Aguarde confirmações de múltiplos timeframes antes de confirmar uma entrada. Lembre-se: se parece fácil demais, provavelmente é uma armadilha.' },
    ],
  },
  {
    id: 7,
    title: 'Mitigação de Order Blocks',
    readTime: 10,
    content: [
      { text: 'Mitigação é o processo pelo qual o preço retorna a um Order Block para "neutralizar" as ordens institucionais pendentes. Este é frequentemente o ponto de entrada mais preciso no SMC — comprar quando o preço retorna a um OB Bullish em tendência de alta.' },
      { heading: 'Tipos de mitigação', text: 'Mitigação total ocorre quando o preço toca o meio do OB. Mitigação parcial é quando toca apenas a extremidade superior ou inferior. Mitigação excessiva (quando o preço vai além do OB) pode invalidar o nível, mas às vezes representa uma oportunidade ainda mais agressiva com invalidação bem definida.' },
      { heading: 'Confirmações após mitigação', text: 'Apenas retornar ao OB não é suficiente. Os melhores setups combinam: rejeição visível no OB (pin bar ou engolfo), confluência com FVG ou zona de liquidez, estrutura de mercado de curto prazo confirmando a inversão, e alinhamento com o bias do timeframe superior.' },
      { text: 'Em cripto, OBs não mitigados de movimentos históricos fortes funcionam como magnetos durante correções de mercado bear. Por exemplo, OBs formados durante o início de um bull run frequentemente são testados durante as consolidações e oferecem excelentes pontos de entrada para posições de médio prazo.' },
    ],
  },
  {
    id: 8,
    title: 'Deslocamento e Momentum',
    readTime: 8,
    content: [
      { text: 'Deslocamento (Displacement) é um movimento de preço súbito, agressivo e unidirecional que indica participação institucional ativa. É caracterizado por velas de alta magnitude com pouca ou nenhuma sombra na direção do movimento, frequentemente criando FVGs ao longo do caminho.' },
      { heading: 'Reconhecendo deslocamentos autênticos', text: 'Um deslocamento genuíno exibe: volume acima da média (3x ou mais), velas com corpo grande e sombras mínimas na direção do movimento, criação de múltiplos FVGs consecutivos, break definitivo de estrutura chave, e preenchimento imediato de ordens passivas acumuladas.' },
      { heading: 'Momentum vs. Deslocamento', text: 'Momentum é sustentado e gradual; deslocamento é explosivo e pontual. Em cripto, deslocamentos frequentemente ocorrem após notícias macroeconômicas, decisões de ETF ou whale movements on-chain. O uso de dados de Open Interest e Long/Short Ratio ajuda a confirmar se o deslocamento tem combustível para continuar.' },
      { text: 'A melhor estratégia após um deslocamento é aguardar o pullback para o FVG mais próximo criado durante o movimento. Este retest, quando respeitado, confirma a participação institucional e oferece uma entrada de baixo risco na direção do deslocamento original.' },
    ],
  },
  {
    id: 9,
    title: 'Confluência de Setups',
    readTime: 14,
    content: [
      { text: 'Confluência é o elemento que separa setups de alta probabilidade de apostas especulativas. Um setup com 7-8 fatores convergindo para a mesma direção tem probabilidade histórica significativamente maior do que um com apenas 2-3 fatores.' },
      { heading: 'Os 8 critérios do Setup Institucional Completo', text: 'O checklist institucional completo verifica: (1) Liquidez — volume validando o movimento, (2) Manipulação — Stop Hunt visível no gráfico, (3) CHOCH — mudança de caráter confirmada, (4) Order Block — zona de entrada identificada, (5) FVG — desequilíbrio presente, (6) Mitigação — retorno ao OB confirmado, (7) Deslocamento — momentum institucional, (8) Alvo — nível de saída claro e definido.' },
      { heading: 'Peso dos timeframes', text: 'Confluência entre timeframes amplifica significativamente a qualidade do setup. Um OB no diário + CHOCH no 4h + FVG no 1h + entrada no 15m representa um "cascata de confluências" que os traders institucionais mais experientes procuram. A regra geral é: bias no timeframe semanal, estrutura no diário/4h, entrada no 1h/15m.' },
      { text: 'A armadilha da confluência é procurar múltiplos sinais quando um único setup bem executado já seria suficiente. A confluência deve ser natural — quando você precisa forçar para encontrar os fatores, provavelmente o setup não existe. Qualidade sobre quantidade: 2-3 setups de alta confluência por mês superam 20 setups mediocres.' },
    ],
  },
  {
    id: 10,
    title: 'Gestão de Risco Institucional',
    readTime: 11,
    content: [
      { text: 'Os grandes players não perdem dinheiro porque têm setups perfeitos — eles não perdem porque têm gestão de risco excepcional. Um trader institucional que acerta 40% das operações pode ser extremamente lucrativo com a gestão correta.' },
      { heading: 'O modelo de risco 1:3 mínimo', text: 'Cada operação deve ter no mínimo 1:3 de relação risco/retorno. Se você arrisca $100, o alvo mínimo deve ser $300. Com 40% de acerto, isso ainda resulta em lucro: 4 wins × $300 = $1200, 6 losses × $100 = $600. Resultado: +$600. A maioria dos traders perde porque aceita setups com R:R abaixo de 1:1.' },
      { heading: 'Sizing de posição e drawdown máximo', text: 'Nunca arrisque mais de 1-2% do capital total por operação. Com 2% de risco por trade e uma série de 10 perdas consecutivas (improvável mas possível), você perde apenas 18% do capital e ainda pode se recuperar. Com 10% por trade, a mesma série resulta em 65% de drawdown — potencialmente fatal para a conta.' },
      { text: 'Em cripto, adicione uma camada extra de gestão: nunca opere com alavancagem acima de 3x em posições de swing, 5x em day trades. A volatilidade extrema do mercado transforma alavancagem alta em liquidação certa no médio prazo. Capital preservado é capital que pode ser usado para as próximas oportunidades.' },
    ],
  },
  {
    id: 11,
    title: 'Psicologia do Trader Institucional',
    readTime: 9,
    content: [
      { text: 'A psicologia é o elemento mais subestimado no trading. Você pode ter o melhor setup, a análise mais precisa, e ainda assim perder dinheiro por não conseguir executar o plano sob pressão emocional. A diferença entre traders institucionais e de varejo frequentemente está no gerenciamento emocional, não na análise.' },
      { heading: 'Os inimigos internos', text: 'FOMO (Fear of Missing Out) leva a entradas tardias em movimentos já avançados. Revenge Trading após uma perda leva a over-trading sem critério. Overconfidence após uma série de wins leva ao aumento impulsivo de tamanho de posição. Anchoring prende o trader a um preço de entrada específico mesmo quando o setup mudou.' },
      { heading: 'O checklist mental antes de operar', text: 'Antes de executar qualquer operação, pergunte: Este setup está dentro das minhas regras? Estou operando porque o gráfico manda, ou porque quero recuperar perdas? Terei capacidade emocional de aceitar a perda máxima deste trade? O tamanho da posição está dentro do meu plano? Se qualquer resposta for hesitante, não opere.' },
      { text: 'Traders que se tornam consistentemente lucrativos desenvolvem um processo, não uma obsessão por resultados. Foque na qualidade de execução do processo. Os lucros são consequência de um processo bem executado repetidamente. Um diário de trades detalhado — registrando não apenas entradas/saídas mas o estado emocional e o raciocínio — é a ferramenta mais poderosa para evolução psicológica.' },
    ],
  },
  {
    id: 12,
    title: 'Estratégias Avançadas SMC',
    readTime: 15,
    content: [
      { text: 'Com o domínio dos conceitos fundamentais do SMC, é possível desenvolver estratégias avançadas que combinam múltiplos elementos de forma sinérgica. Estas estratégias são as que os desks de trading institucional utilizam para gerar alpha consistente.' },
      { heading: 'The Silver Bullet (ICT)', text: 'O Silver Bullet é uma estratégia específica de timing: opera apenas nas janelas 10h-11h ou 14h-15h (horário de NY). Nestas janelas, o algoritmo institucional cria kills zones — movimentos de manipulação rápidos seguidos de reversão. Identificar o FVG criado durante este movimento e entrar no retest oferece setups de alta precisão.' },
      { heading: 'SMC com dados on-chain', text: 'Em cripto, o SMC ganha poder adicional quando combinado com dados on-chain: movimentações de whales (wallets com +1000 BTC), inflows/outflows de exchanges, funding rates de futuros (extremos sinalizam reversões), e open interest (OI crescente com preço subindo confirma tendência; OI crescente com preço caindo sinaliza distribuição).' },
      { heading: 'Multi-timeframe confluence engine', text: 'A estratégia mais robusta combina: Weekly/Monthly — bias geral e zonas de liquidez macro. Daily/4h — estrutura de mercado e OBs primários. 1h/15m — refinamento de entrada e FVGs táticos. 5m/1m — timing de execução e invalidação. Cada timeframe deve confirmar o anterior — discordância entre timeframes é sinal de não operar.' },
      { text: 'A evolução final do trader SMC avançado é a capacidade de ler o gráfico sem indicadores, entendendo puramente a linguagem do preço e do volume. Indicadores como RSI e MACD tornam-se meramente confirmatórios, nunca decisórios. O verdadeiro edge institucional está em ver o que outros não conseguem: a intenção por trás de cada vela.' },
    ],
  },
];

export default function KnowledgeBase() {
  const [selectedChapterId, setSelectedChapterId] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredChapters = useMemo(() => {
    if (!searchQuery.trim()) return CHAPTERS;
    const q = searchQuery.toLowerCase();
    return CHAPTERS.filter(c =>
      c.title.toLowerCase().includes(q) ||
      c.content.some(p => p.text.toLowerCase().includes(q) || (p.heading || '').toLowerCase().includes(q))
    );
  }, [searchQuery]);

  const selectedChapter = CHAPTERS.find(c => c.id === selectedChapterId) || CHAPTERS[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="opacity-0 animate-fade-in" style={{ animationFillMode: 'forwards' }}>
        <h2 className="section-heading font-display text-2xl font-bold text-foreground tracking-wide">Base de Conhecimento Premium</h2>
        <p className="text-sm text-muted-foreground mt-1">
          12 capítulos do livro técnico institucional — Smart Money Concepts
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chapter List Sidebar */}
        <div className="lg:col-span-1 space-y-3">
          {/* Search */}
          <div className="relative opacity-0 animate-fade-in-up stagger-1" style={{ animationFillMode: 'forwards' }}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar capítulos..."
              className="pl-9 bg-surface-3 border-border text-foreground placeholder:text-muted-foreground text-sm"
            />
          </div>

          {/* Chapter list */}
          <div className="space-y-1.5 max-h-[60vh] overflow-y-auto pr-1">
            {filteredChapters.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                Nenhum capítulo encontrado
              </div>
            ) : (
              filteredChapters.map((chapter, i) => (
                <button
                  key={chapter.id}
                  type="button"
                  onClick={() => setSelectedChapterId(chapter.id)}
                  className={`w-full text-left p-3 rounded-lg transition-all opacity-0 animate-fade-in-up ${
                    chapter.id === selectedChapterId
                      ? 'bg-gold/15 border border-gold/40'
                      : 'bg-surface-3 border border-border hover:border-gold/20 hover:bg-gold/5'
                  }`}
                  style={{ animationDelay: `${i * 30}ms`, animationFillMode: 'forwards' }}
                >
                  <div className="flex items-start gap-2.5">
                    <div className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mt-0.5 ${
                      chapter.id === selectedChapterId ? 'bg-gold text-surface-1' : 'bg-muted text-muted-foreground'
                    }`}>
                      {chapter.id}
                    </div>
                    <div className="min-w-0">
                      <div className={`text-xs font-semibold leading-snug ${
                        chapter.id === selectedChapterId ? 'text-gold' : 'text-foreground'
                      }`}>
                        {chapter.title}
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{chapter.readTime} min</span>
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 shrink-0 mt-1 transition-transform ${
                      chapter.id === selectedChapterId ? 'text-gold rotate-90' : 'text-muted-foreground'
                    }`} />
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chapter Content */}
        <div className="lg:col-span-2 card-glow rounded-xl p-6 opacity-0 animate-fade-in-up stagger-2" style={{ animationFillMode: 'forwards' }}>
          {/* Chapter header */}
          <div className="flex items-start gap-4 mb-6 pb-5 border-b border-border">
            <div className="w-12 h-12 rounded-xl bg-gold/15 border border-gold/30 flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5 text-gold" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-mono mb-1">
                CAPÍTULO {selectedChapter.id.toString().padStart(2, '0')}
              </div>
              <h3 className="font-display text-xl font-bold text-foreground tracking-wide leading-tight">
                {selectedChapter.title}
              </h3>
              <div className="flex items-center gap-2 mt-2">
                <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{selectedChapter.readTime} min de leitura</span>
                <span className="text-muted-foreground">•</span>
                <span className="text-xs text-gold">SMC Premium</span>
              </div>
            </div>
          </div>

          {/* Chapter content */}
          <div className="space-y-5 max-h-[55vh] overflow-y-auto pr-2">
            {selectedChapter.content.map((block, i) => (
              <div key={`block-${selectedChapter.id}-${i}`}>
                {block.heading && (
                  <h4 className="font-display font-semibold text-base text-gold mb-2 tracking-wide">
                    {block.heading}
                  </h4>
                )}
                <p className="text-sm text-foreground leading-relaxed" style={{ lineHeight: '1.75' }}>
                  {block.text}
                </p>
              </div>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
            <button
              type="button"
              onClick={() => setSelectedChapterId(Math.max(1, selectedChapter.id - 1))}
              disabled={selectedChapter.id === 1}
              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              ← Anterior
            </button>
            <span className="text-xs text-muted-foreground font-mono">
              {selectedChapter.id} / {CHAPTERS.length}
            </span>
            <button
              type="button"
              onClick={() => setSelectedChapterId(Math.min(CHAPTERS.length, selectedChapter.id + 1))}
              disabled={selectedChapter.id === CHAPTERS.length}
              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Próximo →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
