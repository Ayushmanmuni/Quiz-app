import { describe, it, expect } from 'vitest'
import { validateQuestionsArray } from '@/lib'

describe('validateQuestionsArray', () => {
  it('accepts valid questions', () => {
    const valid = [
      {
        questionText: 'Q?',
        optionA: 'A',
        optionB: 'B',
        optionC: 'C',
        optionD: 'D',
        correctAnswer: 'A',
        explanation: 'Because',
        difficulty: 'easy',
      },
    ]
    const result = validateQuestionsArray(valid)
    expect(result.length).toBe(1)
    expect(result[0].questionText).toBe('Q?')
  })

  it('throws on invalid format', () => {
    const invalid = [
      { questionText: '', optionA: '', optionB: 'B', optionC: 'C', optionD: 'D', correctAnswer: 'Z', explanation: '' },
    ]
    expect(() => validateQuestionsArray(invalid)).toThrow()
  })
})
