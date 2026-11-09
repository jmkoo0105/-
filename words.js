/* =====================================================================
   단어 데이터
   ---------------------------------------------------------------------
   단어 추가하는 법 (사진 한 장 = 범위 하나 = addRange 한 번):
     addRange("묶음 이름", "범위 이름", "부제", `
     단어 | 뜻
     *단어 | 뜻        ← 앞에 * 를 붙이면 '형광펜(중요)' 단어
     `);

   - 뜻 앞의 n. / v. / a. / adv. / prep. / id. 는 품사로 자동 인식돼요.
   - 같은 "묶음 이름"을 쓴 범위끼리 홈 화면에서 한 묶음으로 보여요.
   - 같은 범위 안에 같은 단어가 또 나오면 뜻을 합쳐서 하나로 만들어요.
   - 여러 범위를 같이 고르면 겹치는 단어는 시험에 한 번만 나와요.
   - # 으로 시작하는 줄은 무시돼요(메모용).
   ===================================================================== */

var VOCAB = [];

function addRange(group, name, subtitle, text) {
  var POS = /^(n|v|a|adj|adv|id|prep|conj|pron|phr)\.\s*/i;
  var words = [];
  var index = {};
  text.split('\n').forEach(function (line) {
    line = line.trim();
    if (!line || line.charAt(0) === '#') return;
    var hl = false;
    if (line.charAt(0) === '*') { hl = true; line = line.slice(1).trim(); }
    var parts = line.split('|');
    var word = parts[0].trim();
    var meaning = (parts[1] || '').trim();
    var m = meaning.match(POS);
    var pos = m ? m[1].toLowerCase() : '';
    var id = word.toLowerCase() + '|' + pos;
    if (index[id]) {
      // 같은 범위에 같은 단어가 또 나오면 뜻을 합친다
      var w = index[id];
      w.hl = w.hl || hl;
      var oldParts = w.meaning.replace(POS, '').split(/,\s*/);
      meaning.replace(POS, '').split(/,\s*/).forEach(function (p) {
        if (oldParts.indexOf(p) < 0) oldParts.push(p);
      });
      w.meaning = (m ? m[0] : '') + oldParts.join(', ');
      return;
    }
    var item = { word: word, meaning: meaning, hl: hl };
    index[id] = item;
    words.push(item);
  });
  VOCAB.push({ id: group + '::' + name, group: group, name: name, subtitle: subtitle || '', words: words });
}

/* ----------------------- Lesson 3 Rise Above Challenges ----------------------- */
var L3 = 'Lesson 3 Rise Above Challenges';

addRange(L3, 'p.2', '어휘', `
resilience | n. 회복탄력성, 회복력
overcome | v. 극복하다, 이겨내다
deal with | id. ~을 다루다, 대처하다
cultivate | v. 기르다, 함양하다
*be free from | id. ~이 없다, ~에서 자유롭다
adversity | n. 역경, 고난
*take the form of | id. ~의 형태를 띠다
*cope | v. 대처하다, 대응하다
spring back | id. 다시 튀어 오르다, 회복하다
bounce back | id. 회복하다, 다시 일어서다
handle | v. 다루다, 처리하다
*benefit from | id. ~로부터 이익을 얻다
*elasticity | n. 탄력성, 유연성
flexibility | n. 유연성, 적응성
*surmount | v. 극복하다, 뛰어넘다
*prevail over | id. ~을 이겨내다, 압도하다
*foster | v. 기르다, 촉진하다
*nurture | v. 양성하다, 기르다
hardship | n. 고난, 어려움
*affliction | n. 고통, 시련
*ordeal | n. 시련, 고난
*setback | n. 좌절, 차질
*catastrophe | n. 대참사, 큰 재앙
*grapple with | id. ~와 씨름하다, 대처하다
vulnerability | n. 취약성, 상처받기 쉬움
fragility | n. 연약함, 부서지기 쉬움
rigidity | n. 경직성, 엄격함
*succumb to | id. ~에 굴복하다, 무너지다
*yield to | id. ~에 굴복하다, 양보하다
*give in to | id. ~에 굴복하다, 마지못해 받아들이다
*prosperity | n. 번영, 번창
collapse | v. 무너지다, 붕괴하다
*weather the storm | id. 역경을 이겨내다, 위기를 넘기다
*capitalize on | id. ~을 기회로 활용하다, 이용하다, 사용하다
*rise above | id. (역경·한계를) 뛰어넘다, 극복하다
*get back on one's feet | id. (실패·병 후) 다시 일어서다, 재기하다
*take a toll on | id. ~에 악영향을 미치다, ~에 타격을 주다
*immune to | id. ~에 면역이 있는, ~에 영향을 받지 않는
*fortitude | n. 불굴의 용기, 강인함
catalyst | n. 촉매제, 기폭제
`);

addRange(L3, 'p.3', '본문 형광펜', `
*maturation | n. 성숙, 성장
*withstand | v. 견뎌내다, 버티다
*recuperate | v. (~에서) 회복하다, 기운을 되찾다
*distress | n. 고통, 괴로움
*harness | v. 동력으로 이용하다, 활용하다
`);

addRange(L3, 'p.8', '어휘', `
countless | a. 무수한, 셀 수 없이 많은
*stepping stone | id. 디딤돌, 발판
*disrespect | v. 무시하다, 존중하지 않다
*blessing | n. 축복, 다행한 일
inspire | v. 영감을 주다, 고무하다
*result in | id. ~을 초래하다, 야기하다
compete | v. 경쟁하다, 겨루다
disability | n. 장애, 무능력
*open the door for | id. ~의 기회를 열다, 발판을 마련하다
potential | n. 잠재력, 가능성
thanks to | id. ~ 덕분에, ~ 때문에
exceptional | a. 특별한, 예외적인
*lasting | a. 지속적인, 영구적인
*build up | id. ~을 키우다, 강화하다
*springboard | n. 도약판, 발판
*impetus | n. 추진력, 자극, 원동력
*blessing in disguise | id. 전화위복, 결과적으로 다행한 일
*bring about | id. ~을 초래하다, 야기하다
*give rise to | id. ~을 일으키다, 낳다
*impairment | n. (신체적·정신적) 장애, 손상
*pave the way for | id. ~의 기틀을 마련하다, 길을 열다
*owing to | id. ~ 덕분에, ~ 때문에
extraordinary | a. 비범한, 특별한
innate | a. 타고난, 선천적인
*inborn | a. 타고난, 선천적인
*enduring | a. 지속적인, 오래가는
*stumbling block | id. 걸림돌, 장애물
*impediment | n. 방해물, 장애물
*stem from | id. ~에서 기인하다, 유래하다
*regardless of | id. ~에 상관없이, ~에도 불구하고
*in spite of | id. ~에도 불구하고
*commonplace | a. 평범한, 흔한
*acquired | a. 후천적인, 습득된
*fleeting | a. 일시적인, 잠깐의
*exclusive to | id. ~만의, ~에 국한된
*turn the tables | id. 판세를 뒤집다, 역전시키다
*harness | v. 동력으로 이용하다, 활용하다
*latent | a. 잠재된, 숨어 있는
*malleable | a. 훈련으로 변화 가능한, 유연한
*hone | v. (기술·능력 등을) 연마하다, 갈고닦다
`);

addRange(L3, 'p.9', '본문 형광펜', `
*latent | a. 잠재된, 숨어 있는
*privilege | n. 특권
*be reserved for | id. ~에게만 허락되다, ~을 위해 따로 마련되다
*malleable | a. 훈련으로 변화 가능한, 유연한
*habitual | a. 습관적인
*trainability | n. 훈련 가능성
*pave the way for | id. ~의 기틀을 마련하다, 길을 열다
`);

addRange(L3, 'p.14', '어휘', `
accept | v. 받아들이다, 수용하다
passive | a. 수동적인, 소극적인
*single out | id. ~만 따로 골라내다, 지목하다
embrace | v. 포용하다, 기꺼이 받아들이다
obstacle | n. 장애물, 난관
confront | v. 맞서다, 직면하다
look after | id. ~을 돌보다, 보살피다
meditate | v. 명상하다, 숙고하다
observe | v. 관찰하다, 주시하다
*proceed with | id. ~을 계속 진행하다
*clarity | n. 명확성, 명료함
*support network | id. 사회적 지지망, 후원 관계
*come to terms with | id. (어려운 현실을) 받아들이다, 수용하다
*face up to | id. ~에 당당히 맞서다, 직면하다
*hurdle | n. 난관, 장애물
*stumbling block | id. 걸림돌, 장애물
*contemplate | v. 차분히 생각하다, 명상하다
*scrutinize | v. 면밀히 살피다, 관찰하다
*lucidity | n. 명료함, 명쾌함
*reach out to | id. ~에게 도움을 청하다, 손을 뻗다
*proactive | a. 주도적인, 적극적인
*evade | v. 회피하다, 모면하다
*shirk | v. (책임·문제 등을) 회피하다
neglect | v. 방치하다, 소홀히 하다
ambiguity | n. 모호함, 불명확성
*obscurity | n. 불분명함, 모호함
alienation | n. 소외, 멀리함
isolation | n. 고립, 단절
*dwell on | id. (과거·실패 등에) 얽매이다, 곱씹다
*take a step back | id. 한 걸음 물러서서 생각하다
*keep in perspective | id. 균형 잡힌 시각을 유지하다
*fall victim to | id. ~의 희생양이 되다, 사로잡히다
*resignation | n. 체념, 순응
*composure | n. 평정심, 침착함
*impartial | a. 편견 없는, 치우치지 않은
*detached | a. 객관적인, 거리를 둔
*confide in | id. ~에게 속마음을 털어놓다
*lean on | id. ~에 의지하다, 기대다
*self-pity | n. 자기 연민
*rapport | n. 친밀한 유대 관계, 공감대
`);

addRange(L3, 'p.15', '본문 형광펜', `
*mindfulness | n. 마음챙김
*hinge on | id. ~에 달려 있다
*dwell on | id. (과거·실패 등에) 얽매이다, 곱씹다
*multidimensional | a. 다각적인, 다차원적인
*proactive | a. 주도적인, 적극적인
*calmly | adv. 차분히, 침착하게
*entail | v. 수반하다
*equilibrium | n. (정신적) 평형, 균형
`);

addRange(L3, 'p.20', '어휘', `
urge | v. 강력히 권고하다, 촉구하다
*in the middle of | id. ~의 한가운데에, ~의 도중에
uncertainty | n. 불확실성, 반신반의
*endure | v. 견디다, 인내하다
*gradually | adv. 점진적으로, 서서히
deal with | id. ~을 처리하다, 대처하다
*fulfilled | a. 성취감을 느끼는, 만족스러운
overcome | v. 극복하다, 이겨내다
*in the midst of | id. ~의 한가운데에, ~의 와중에
unpredictability | n. 예측 불가능성
*persevere | v. 인내하며 계속하다, 버티다
*withstand | v. 견뎌내다, 버티다
*weather | v. (위기·시련을) 무사히 넘기다
*progressively | adv. 점진적으로, 차츰
*contented | a. 만족하는, 자족하는
*gratified | a. 기뻐하는, 만족해하는
conquer | v. 정복하다, 극복하다
*triumph over | id. ~을 이겨내다, 승리하다
eradicate | v. 뿌리 뽑다, 완전히 제거하다
*do away with | id. ~을 없애다, 제거하다
certainty | n. 확실성, 확신
*succumb to | id. ~에 굴복하다, 무너지다
*give way to | id. ~에 무너지다, ~로 대체되다
*abruptly | adv. 갑작스럽게, 불시에
*frustrated | a. 좌절감을 느끼는, 불만스러운
*discontented | a. 불만족스러운, 불평하는
*intimidated | a. 겁을 먹은, 위축된
*shy away from | id. (두려움 등으로) ~을 피하다
*shrink from | id. ~을 회피하다, 주저하다
*fortitude | n. 불굴의 용기, 강인함
*perseverance | n. 인내심, 끈기
*tenacity | n. 끈기, 불굴의 의지
trivial | a. 사소한, 하찮은
*negligible | a. 무시해도 될 정도의, 사소한
*formidable | a. 감당하기 힘든, 어마어마한
*daunting | a. 기를 꺾는, 벅찬
*immune to | id. ~에 면역이 있는, ~에 영향을 받지 않는
*build up to | id. 점차 역량을 키우다, 대비하다
*rise to the occasion | id. 위기 상황에서 능력을 발휘하다
*take in stride | id. ~을 침착하게 받아들이다
`);

addRange(L3, 'p.21', '본문 형광펜', `
*minor | a. 사소한, 작은
*contented | a. 만족하는, 자족하는
*dread | n. 두려움, 공포
*fortify | v. 강화하다, 튼튼하게 하다
*amid | prep. ~의 한가운데에, ~ 속에서
*surmount | v. 극복하다, 뛰어넘다
*cornerstone | n. 초석, 토대
*forge | v. (시련을 통해) 단련하다, 벼려 내다
*attain | v. 이루다, 달성하다
*gratified | a. 기뻐하는, 만족해하는
*unintimidated | a. 위축되지 않는, 겁먹지 않는
*setback | n. 좌절, 차질
*distress | n. 고통, 괴로움
*withstand | v. 견뎌내다, 버티다
`);

addRange(L3, 'p.26', '어휘', `
mindset | n. 사고방식, 마음가짐
deal with | id. ~을 다루다, 대처하다
fixed | a. 고정된, 변하지 않는
limited | a. 제한된, 한계가 있는
comfort zone | id. 안전지대, 안주하는 영역
reject | v. 거부하다, 물리치다
constructive | a. 건설적인, 발전적인
criticism | n. 비판, 비평
*defeated | a. 패배감을 느끼는, 좌절한
empower | v. 힘을 실어주다, 가능하게 하다
*imperfection | n. 불완전함, 결점
*would rather | id. 차라리 ~하는 편이 낫다
*outlook | n. 관점, 사고방식
*mentality | n. 사고방식, 정신 상태
*finite | a. 유한한, 한정된
*confined | a. 제한된, 국한된
productive | a. 생산적인, 발전적인
beneficial | a. 유익한, 이로운
flaw | n. 결함, 부족한 점
*shortcoming | n. 결점, 단점
enable | v. 가능하게 하다, 역량을 주다
flexible | a. 유연한, 융통성 있는
adaptable | a. 적응할 수 있는, 유연한
*boundless | a. 무한한, 끝없는
*receptive to | id. ~을 기꺼이 수용하는, 받아들이는
*open to | id. ~에 열려 있는, ~을 수용하는
destructive | a. 파괴적인, 해로운
*detrimental | a. 해로운, 불리한
perfection | n. 완벽함, 완전무결
discourage | v. 단념시키다, 기를 꺾다
*shy away from | id. (두려움 등으로) ~을 피하다
*settle for | id. ~에 안주하다, 만족하다
*rest on one's laurels | id. 현재의 상태에 안주하다
*take to heart | id. ~을 진지하게 받아들이다
*brush off | id. ~을 묵살하다, 일축하다
*turn a deaf ear to | id. ~에 귀를 기울이지 않다, 외면하다
*weather | v. (시련·비판 등을) 꿋꿋이 견뎌내다
stepping stone | id. 디딤돌, 발판
*stagnation | n. 침체, 정체
*complacent | a. 현실에 안주하는, 자기만족적인
`);

addRange(L3, 'p.27', '본문 형광펜', `
*succumb to | id. ~에 굴복하다, 무너지다
*finite | a. 유한한, 한정된
*take in stride | id. ~을 침착하게 받아들이다
*divergent | a. 서로 다른, 상이한
*oriented | a. ~ 지향의, ~ 중심의
*maturation | n. 성숙, 성장
*stagnation | n. 침체, 정체
*hone | v. (기술·능력 등을) 연마하다, 갈고닦다
*surmount | v. 극복하다, 뛰어넘다
`);
