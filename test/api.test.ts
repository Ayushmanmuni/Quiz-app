import { describe, it, expect, beforeEach, vi } from 'vitest'
import { validateQuestionsArray } from '@/lib'
import { checkRateLimit } from '@/middleware/rateLimit'
import { NextRequest } from 'next/server'

describe('API Validation', () => {
  describe('validateQuestionsArray', () => {
    it('accepts valid questions with all required fields', () => {
      const valid = [
        {
          questionText: 'What is 2+2?',
          optionA: '3',
          optionB: '4',
          optionC: '5',
          optionD: '6',
          correctAnswer: 'B',
          explanation: 'Simple arithmetic',
          difficulty: 'easy',
        },
      ]
      const result = validateQuestionsArray(valid)
      expect(result.length).toBe(1)
      expect(result[0].questionText).toBe('What is 2+2?')
      expect(result[0].correctAnswer).toBe('B')
    })

    it('rejects empty question text', () => {
      const invalid = [
        {
          questionText: '   ',
          optionA: 'A',
          optionB: 'B',
          optionC: 'C',
          optionD: 'D',
          correctAnswer: 'A',
          explanation: 'test',
        },
      ]
      expect(() => validateQuestionsArray(invalid)).toThrow()
    })

    it('rejects invalid correctAnswer value', () => {
      const invalid = [
        {
          questionText: 'Q?',
          optionA: 'A',
          optionB: 'B',
          optionC: 'C',
          optionD: 'D',
          correctAnswer: 'Z',
          explanation: 'test',
        },
      ]
      expect(() => validateQuestionsArray(invalid)).toThrow()
    })

    it('rejects missing options', () => {
      const invalid = [
        {
          questionText: 'Q?',
          optionA: 'A',
          optionB: 'B',
          correctAnswer: 'A',
          explanation: 'test',
        },
      ]
      expect(() => validateQuestionsArray(invalid)).toThrow()
    })

    it('trims whitespace from fields', () => {
      const valid = [
        {
          questionText: '  What is AI?  ',
          optionA: '  Artificial Intelligence  ',
          optionB: 'B',
          optionC: 'C',
          optionD: 'D',
          correctAnswer: 'A',
          explanation: '  It stands for Artificial Intelligence  ',
          difficulty: 'medium',
        },
      ]
      const result = validateQuestionsArray(valid)
      expect(result[0].questionText).toBe('What is AI?')
      expect(result[0].optionA).toBe('Artificial Intelligence')
      expect(result[0].explanation).toBe('It stands for Artificial Intelligence')
    })
  })

  describe('checkRateLimit', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    it('allows first request', async () => {
      const req = new NextRequest('http://localhost/api/test')
      const result = await checkRateLimit(req, 'user:123')
      expect(result.allowed).toBe(true)
    })

    it('allows requests up to max limit', async () => {
      const req = new NextRequest('http://localhost/api/test')
      for (let i = 0; i < 3; i++) {
        const result = await checkRateLimit(req, 'user:456', {
          maxRequests: 3,
          windowMs: 60000,
        })
        expect(result.allowed).toBe(true)
      }
    })

    it('rejects request exceeding limit', async () => {
      const req = new NextRequest('http://localhost/api/test')
      for (let i = 0; i < 3; i++) {
        await checkRateLimit(req, 'user:789', {
          maxRequests: 3,
          windowMs: 60000,
        })
      }
      const result = await checkRateLimit(req, 'user:789', {
        maxRequests: 3,
        windowMs: 60000,
      })
      expect(result.allowed).toBe(false)
      expect(result.retryAfter).toBeDefined()
    })

    it('resets limit after window expires', async () => {
      const req = new NextRequest('http://localhost/api/test')
      await checkRateLimit(req, 'user:999', {
        maxRequests: 1,
        windowMs: 60000,
      })

      // Exhaust the limit
      let result = await checkRateLimit(req, 'user:999', {
        maxRequests: 1,
        windowMs: 60000,
      })
      expect(result.allowed).toBe(false)

      // Move time forward past the window
      vi.advanceTimersByTime(61000)

      // Should now allow again
      result = await checkRateLimit(req, 'user:999', {
        maxRequests: 1,
        windowMs: 60000,
      })
      expect(result.allowed).toBe(true)
    })
  })
})
