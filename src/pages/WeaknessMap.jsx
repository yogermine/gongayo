import { useState, useEffect } from 'react'

const SAMPLE_WEAKNESSES = [
  { subject: '국어', topic: '비문학 추론', wrongRate: 78, count: 5, videos: ['국어 비문학 추론 전략 수능', 'EBS 비문학 독해법'] },
  { subject: '수학', topic: '수열의 극한', wrongRate: 65, count: 4, videos: ['수열 극한 개념 정리', '수학 수열 수능 기출'] },
  { subject: '영어', topic: '빈칸 추론', wrongRate: 58, count: 3, videos: ['영어 빈칸 추론 전략', 'EBS 영어 빈칸'] },
]

function VideoCard({ title, query }) {
  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'var(--surface2)', borderRadius: 8, textDecoration: 'none', transition: 'background 0.15s' }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--color-primary-light)'}
      onMouseLeave={e => e.currentTarget.style.background = 'var(--surface2)'}>
      <div style={{ width: 28, height: 28, borderRadius: 6, background: '#FF0000', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="white"><polygon points="3,1 9,5 3,9" /></svg>
      </div>
      <span style={{ fontSize: 12, color: 'var(--text-primary)', lineHeight: 1.4 }}>{title}</span>
    </a>
  )
}

export default function WeaknessMap({ data }) {
  const [selected, setSelected] = useState(null)
  const weaknesses = data.weaknesses?.length > 0 ? data.weaknesses : SAMPLE_WEAKNESSES
  const displayWeaknesses = weaknesses.length > 0 && weaknesses[0].subject ? weaknesses : SAMPLE_WEAKNESSES

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>약점 지도</div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>오답이 많은 단원과 맞춤 강의를 확인하세요</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
        {SAMPLE_WEAKNESSES.map((w, i) => (
          <div key={i} className="card" style={{ cursor: 'pointer', border: selected === i ? '1.5px solid var(--color-primary)' : '1px solid var(--border)', transition: 'all 0.15s' }}
            onClick={() => setSelected(selected === i ? null : i)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: selected === i ? 14 : 0 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: i === 0 ? 'var(--color-primary-light)' : i === 1 ? 'var(--color-success-light)' : 'var(--color-accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: i === 0 ? 'var(--color-primary)' : i === 1 ? 'var(--color-success)' : '#92400E', flexShrink: 0 }}>{i + 1}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{w.subject} — {w.topic}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: w.wrongRate >= 70 ? 'var(--color-danger)' : w.wrongRate >= 50 ? 'var(--color-warning)' : 'var(--color-success)' }}>{w.wrongRate}%</div>
                </div>
                <div style={{ height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: 3, width: `${w.wrongRate}%`, background: w.wrongRate >= 70 ? 'var(--color-danger)' : w.wrongRate >= 50 ? 'var(--color-warning)' : 'var(--color-success)', transition: 'width 0.6s' }} />
                </div>
              </div>
            </div>
            {selected === i && (
              <div className="fade-in">
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 10 }}>오답률 {w.wrongRate}% — 수준별 추천 강의</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {w.videos.map((v, vi) => <VideoCard key={vi} title={v} query={v} />)}
                  <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(w.topic + ' 수능 강의')}`} target="_blank" rel="noopener noreferrer"
                    style={{ fontSize: 12, color: 'var(--color-primary)', textAlign: 'center', padding: '8px', textDecoration: 'none' }}>
                    유튜브에서 더 보기 →
                  </a>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="card" style={{ background: 'var(--color-primary-light)', border: '1px solid rgba(67,56,202,0.15)' }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-primary)', marginBottom: 6 }}>학습 전략 팁</div>
        <div style={{ fontSize: 12, color: '#3730A3', lineHeight: 1.7 }}>
          오답률 70% 이상 단원을 먼저 집중 공략하세요. 하루 30분씩 해당 단원의 기출 영상을 보고, 유사 문제를 5개 이상 풀어보면 2주 안에 오답률을 절반으로 줄일 수 있습니다.
        </div>
      </div>
    </div>
  )
}
