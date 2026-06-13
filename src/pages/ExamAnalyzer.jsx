import { useState } from 'react'
import { supabase } from '../lib/supabase'
const ANTHROPIC_API = '/api/claude'
console.log('🔍 SUPABASE URL:', import.meta.env.VITE_SUPABASE_URL)

function Spinner() {
  return <span style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
}

export default function ExamAnalyzer({ data, setData }) {
  const [step, setStep] = useState(1)
  const [examName, setExamName] = useState('')
  const [subject, setSubject] = useState('')
  const [questions, setQuestions] = useState([])
  const [qForm, setQForm] = useState({ num: '', pts: '', content: '', answer: '' })
  const [students, setStudents] = useState([{ name: '', answers: {} }])
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  const addQuestion = () => {
    if (!qForm.num || !qForm.content || !qForm.answer) return
    setQuestions(p => [...p, { ...qForm }])
    setQForm({ num: String(questions.length + 2), pts: '', content: '', answer: '' })
  }

  const removeQ = i => setQuestions(p => p.filter((_, idx) => idx !== i))

  const addStudent = () => setStudents(p => [...p, { name: '', answers: {} }])

  const updateStudent = (si, field, val) => {
    setStudents(p => p.map((s, i) => i === si ? { ...s, [field]: val } : s))
  }

  const updateAnswer = (si, qNum, val) => {
    setStudents(p => p.map((s, i) => i === si ? { ...s, answers: { ...s.answers, [qNum]: val } } : s))
  }

  const normalize = s => s.trim().toLowerCase().replace(/\s+/g, '').replace(/[①②③④⑤]/g, c => ['①','②','③','④','⑤'].indexOf(c) + 1 + '')

  const grade = async () => {
    //supabase시험 저장
     console.log('🔍 ENV:', import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY?.slice(0,10))
if (!supabase) {
      console.error('❌ Supabase 연결 안됨 - 환경변수 확인 필요')
    } else {

    try {


      
      // 시험 저장
      const { data: examRow, error: examErr } = await supabase
        .from('exams')
        .insert({ exam_name: examName, subject, grade: data.grade || '' })
        .select()
        .single()

      if (examErr) throw examErr

      // 문제 저장
      const qRows = questions.map(q => ({
        exam_id: examRow.id,
        question_num: q.num,
        content: q.content,
        answer: q.answer,
        points: Number(q.pts || 1)
      }))
      await supabase.from('exam_questions').insert(qRows)

      // 학생 결과 저장
      const sRows = analysisResults.map(s => ({
        exam_id: examRow.id,
        student_name: s.name,
        answers: s.answers,
        score: s.score,
        total_points: questions.reduce((sum, q) => sum + Number(q.pts || 1), 0),
        ai_feedback: s.feedback
      }))
      await supabase.from('student_results').insert(sRows)

      console.log('✅ Supabase 저장 완료:', examRow.id)
    } catch (saveErr) {
      console.error('Supabase 저장 실패:', saveErr)
    }
    
          } catch (saveErr) {
        console.error('Supabase 저장 실패:', saveErr)
      }
    }
    // ── 저장 끝 ──
    setLoading(true)
    const totalPts = questions.reduce((s, q) => s + Number(q.pts || 1), 0)

    const scored = students.filter(s => s.name).map(s => {
      let earned = 0
      const results = {}
      questions.forEach(q => {
        const correct = normalize(q.answer)
        const given = normalize(s.answers[q.num] || '')
        const ok = given !== '' && (given === correct || correct.includes(given) || given.includes(correct))
        results[q.num] = ok
        if (ok) earned += Number(q.pts || 1)
      })
      return { ...s, earned, results, score: Math.round(earned / totalPts * 100) }
    })

    const analysisResults = []
    for (const s of scored) {
      const wrongQs = questions.filter(q => !s.results[q.num])
      const rightQs = questions.filter(q => s.results[q.num])
      const prompt = `당신은 학습 분석 AI입니다. 아래 학생의 시험 결과를 분석해 교사처럼 따뜻하고 구체적으로 피드백을 작성하세요.

[시험] ${examName} | ${subject} | 총점 ${totalPts}점
[학생] ${s.name} | ${data.grade || ''} | 취득 ${s.earned}점 (${s.score}%)

[정답 문항 ${rightQs.length}개]
${rightQs.map(q => `${q.num}번: ${q.content}`).join('\n') || '없음'}

[오답 문항 ${wrongQs.length}개]
${wrongQs.map(q => `${q.num}번: ${q.content} | 정답: ${q.answer} | 학생답: ${s.answers[q.num] || '무응답'}`).join('\n') || '없음'}

다음 세 항목으로 구분해 각 2-3문장씩 작성하세요:
▶ 현재 상태: 점수와 이해도 평가
▶ 핵심 취약점: 오답에서 드러나는 개념 문제
▶ 학습 방향: 다음 주에 바로 실천할 수 있는 구체적 행동 2가지

한국어로, 학생에게 직접 말하는 톤으로 작성하세요.`

      try {
        const res = await fetch(ANTHROPIC_API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 800, messages: [{ role: 'user', content: prompt }] })
        })
        const json = await res.json()
        const feedback = json.content?.map(b => b.text || '').join('') || '피드백 생성 실패'
        analysisResults.push({ ...s, feedback })
      } catch {
        analysisResults.push({ ...s, feedback: '네트워크 오류로 피드백을 생성하지 못했습니다.' })
      }
    }

    const totalScore = scored.reduce((a, s) => a + s.score, 0)
    const avg = Math.round(totalScore / scored.length)
    const wrongFreq = {}
    questions.forEach(q => { wrongFreq[q.num] = scored.filter(s => !s.results[q.num]).length })
    const hardest = Object.entries(wrongFreq).sort((a, b) => b[1] - a[1])[0]

    setResults(analysisResults)
    setData(prev => ({
      ...prev,
      examHistory: [...(prev.examHistory || []), {
        examName, date: new Date().toLocaleDateString('ko-KR'),
        score: avg, wrongCount: questions.length - questions.filter(q => scored.every(s => s.results[q.num])).length
      }],
      weaknesses: hardest ? [...(prev.weaknesses || []), { qNum: hardest[0], subject, examName }] : prev.weaknesses
    }))
    setLoading(false)
    setStep(3)
  }

  if (step === 3) return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ fontSize: 18, fontWeight: 700 }}>AI 분석 결과</div>
        <button className="btn-secondary" style={{ fontSize: 12 }} onClick={() => { setStep(1); setQuestions([]); setStudents([{ name: '', answers: {} }]); setResults([]) }}>새 시험 분석</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 20 }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 4 }}>평균 점수</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-primary)' }}>{Math.round(results.reduce((a, r) => a + r.score, 0) / results.length)}점</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 4 }}>분석 인원</div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{results.length}명</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 4 }}>총 문항</div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{questions.length}개</div>
        </div>
      </div>

      {results.map((r, i) => {
        const color = r.score >= 80 ? 'var(--color-success)' : r.score >= 60 ? 'var(--color-warning)' : 'var(--color-danger)'
        const bgColor = r.score >= 80 ? 'var(--color-success-light)' : r.score >= 60 ? 'var(--color-accent-light)' : 'var(--color-danger-light)'
        return (
          <div key={i} className="card fade-in" style={{ marginBottom: 12, animationDelay: `${i * 0.1}s` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div>
                <span style={{ fontSize: 15, fontWeight: 700 }}>{r.name}</span>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)', marginLeft: 8 }}>{r.earned}점 / {questions.reduce((s, q) => s + Number(q.pts || 1), 0)}점</span>
              </div>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color }}>
                {r.score}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
              {questions.map(q => (
                <span key={q.num} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: r.results[q.num] ? 'var(--color-success-light)' : 'var(--color-danger-light)', color: r.results[q.num] ? 'var(--color-success)' : 'var(--color-danger)' }}>
                  {q.num}번 {r.results[q.num] ? 'O' : 'X'}
                </span>
              ))}
            </div>
            <div style={{ background: '#F0F4FF', borderRadius: 10, padding: '14px 16px' }}>
              <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-primary)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-primary)', display: 'inline-block' }} />
                AI 맞춤 피드백
              </div>
              <div style={{ fontSize: 12, color: '#374151', lineHeight: 1.8, whiteSpace: 'pre-line' }}>
                {r.feedback}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>답안 분석</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['시험 정보 & 문제 입력', '학생 답안 입력', 'AI 분석 결과'].map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: step > i + 1 ? 'var(--color-success)' : step === i + 1 ? 'var(--color-primary)' : 'var(--text-tertiary)' }}>
              <span style={{ width: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, background: step > i + 1 ? 'var(--color-success-light)' : step === i + 1 ? 'var(--color-primary-light)' : 'var(--surface2)', color: step > i + 1 ? 'var(--color-success)' : step === i + 1 ? 'var(--color-primary)' : 'var(--text-tertiary)' }}>{i + 1}</span>
              {s}
              {i < 2 && <span style={{ color: 'var(--text-tertiary)' }}>›</span>}
            </div>
          ))}
        </div>
      </div>

      {step === 1 && (
        <>
          <div className="card" style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 12 }}>시험 기본 정보</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>시험 이름</label>
                <input value={examName} onChange={e => setExamName(e.target.value)} placeholder="예) 2단원 중간고사" />
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>과목</label>
                <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="예) 수학, 국어" />
              </div>
            </div>
          </div>

          <div className="card" style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 12 }}>문제 추가</div>
            <div style={{ display: 'grid', gridTemplateColumns: '60px 60px 1fr', gap: 8, marginBottom: 10 }}>
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>번호</label>
                <input value={qForm.num} onChange={e => setQForm(p => ({ ...p, num: e.target.value }))} placeholder="1" />
              </div>
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>배점</label>
                <input value={qForm.pts} onChange={e => setQForm(p => ({ ...p, pts: e.target.value }))} placeholder="5" />
              </div>
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>정답</label>
                <input value={qForm.answer} onChange={e => setQForm(p => ({ ...p, answer: e.target.value }))} placeholder="예) ③ 또는 직접 입력" />
              </div>
            </div>
            <div style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>문제 내용</label>
              <textarea value={qForm.content} onChange={e => setQForm(p => ({ ...p, content: e.target.value }))} placeholder="문제 내용을 입력하세요" rows={2} />
            </div>
            <button className="btn-secondary" onClick={addQuestion} style={{ fontSize: 13 }}>+ 문제 추가</button>
          </div>

          {questions.length > 0 && (
            <div className="card" style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 10 }}>등록된 문제 {questions.length}개</div>
              {questions.map((q, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '10px 0', borderBottom: i < questions.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 2 }}>{q.num}번 · {q.pts || 1}점</div>
                    <div style={{ fontSize: 13 }}>{q.content}</div>
                    <div style={{ fontSize: 12, color: 'var(--color-primary)', marginTop: 2 }}>정답: {q.answer}</div>
                  </div>
                  <button onClick={() => removeQ(i)} style={{ fontSize: 12, color: 'var(--color-danger)', background: 'none', padding: '2px 6px' }}>삭제</button>
                </div>
              ))}
            </div>
          )}

          <button className="btn-primary" onClick={() => setStep(2)} disabled={!examName || questions.length === 0} style={{ width: '100%' }}>
            학생 답안 입력하기 →
          </button>
        </>
      )}

      {step === 2 && (
        <>
          <div className="card" style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 12 }}>학생 답안 입력</div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '8px 8px', color: 'var(--text-secondary)', fontWeight: 500, borderBottom: '1px solid var(--border)', minWidth: 80 }}>이름</th>
                    {questions.map(q => (
                      <th key={q.num} style={{ textAlign: 'center', padding: '8px 6px', color: 'var(--text-secondary)', fontWeight: 500, borderBottom: '1px solid var(--border)', minWidth: 60 }}>
                        {q.num}번<br /><span style={{ fontSize: 10, fontWeight: 400, color: 'var(--text-tertiary)' }}>({q.pts || 1}점)</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {students.map((s, si) => (
                    <tr key={si}>
                      <td style={{ padding: '6px 8px' }}>
                        <input value={s.name} onChange={e => updateStudent(si, 'name', e.target.value)} placeholder={`학생${si + 1}`} style={{ width: 80, fontSize: 12, padding: '6px 8px' }} />
                      </td>
                      {questions.map(q => (
                        <td key={q.num} style={{ padding: '6px 4px', textAlign: 'center' }}>
                          <input value={s.answers[q.num] || ''} onChange={e => updateAnswer(si, q.num, e.target.value)} placeholder="답" style={{ width: 52, textAlign: 'center', fontSize: 12, padding: '6px 4px' }} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button className="btn-secondary" onClick={addStudent} style={{ marginTop: 12, fontSize: 13 }}>+ 학생 추가</button>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn-secondary" onClick={() => setStep(1)} style={{ flex: 1 }}>← 이전</button>
            <button className="btn-primary" onClick={grade} disabled={loading || students.filter(s => s.name).length === 0} style={{ flex: 2 }}>
              {loading ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}><Spinner /> AI 분석 중...</span> : 'AI 분석 시작하기'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
