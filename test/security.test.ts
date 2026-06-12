import { describe, it, expect } from 'vitest'
import { isValidEmail, isStrongPassword, sanitizeForDb, escapeHtml } from '@/lib/security'

describe('Security Validators', () => {
  describe('Email validation', () => {
    it('accepts valid emails', () => {
      expect(isValidEmail('test@example.com')).toBe(true)
      expect(isValidEmail('user.name+tag@domain.co.uk')).toBe(true)
    })

    it('rejects invalid emails', () => {
      expect(isValidEmail('plaintext')).toBe(false)
      expect(isValidEmail('@example.com')).toBe(false)
      expect(isValidEmail('test@')).toBe(false)
      expect(isValidEmail('test @example.com')).toBe(false)
    })
  })

  describe('Password strength', () => {
    it('accepts strong passwords', () => {
      expect(isStrongPassword('SecurePass123!')).toBe(true)
      expect(isStrongPassword('MyPassword@2024')).toBe(true)
    })

    it('rejects weak passwords', () => {
      expect(isStrongPassword('short')).toBe(false) // too short
      expect(isStrongPassword('alllowercase123!')).toBe(false) // no uppercase
      expect(isStrongPassword('ALLUPPERCASE123!')).toBe(false) // no lowercase
      expect(isStrongPassword('NoSpecialChar123')).toBe(false) // no special char
      expect(isStrongPassword('NoNumbers!')).toBe(false) // no numbers
    })
  })

  describe('SQL injection prevention', () => {
    it('removes dangerous characters', () => {
      expect(sanitizeForDb("'; DROP TABLE users; --")).toBe(" DROP TABLE users ")
      expect(sanitizeForDb('test%value')).toBe('testvalue')
    })
  })

  describe('XSS prevention', () => {
    it('escapes HTML entities', () => {
      expect(escapeHtml('<script>alert("xss")</script>')).toBe(
        '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
      )
      expect(escapeHtml("test & test")).toBe('test &amp; test')
    })
  })
})
