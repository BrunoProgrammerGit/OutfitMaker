import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import GoogleAuthButton from './GoogleAuthButton'

vi.mock('../../lib/api', () => ({
  default: { post: vi.fn() },
}))

// Simulamos el widget de Google: un botón que entrega un credential fijo.
vi.mock('@react-oauth/google', () => ({
  GoogleLogin: ({ onSuccess }) => (
    <button
      type="button"
      onClick={() => onSuccess({ credential: 'fake-google-id-token' })}
    >
      Continuar con Google
    </button>
  ),
}))

import api from '../../lib/api'

function renderButton(props) {
  const qc = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <GoogleAuthButton {...props} />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('GoogleAuthButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('sends the Google credential to the backend', async () => {
    api.post.mockResolvedValueOnce({
      data: { accessToken: 'app-jwt', user: { id: 1, email: 'a@b.com' } },
    })
    renderButton()
    await userEvent.click(screen.getByRole('button', { name: /google/i }))
    await waitFor(() =>
      expect(api.post).toHaveBeenCalledWith('/auth/google', {
        credential: 'fake-google-id-token',
      }),
    )
  })

  it('stores the app JWT (not the Google token) on success', async () => {
    api.post.mockResolvedValueOnce({
      data: { accessToken: 'app-jwt', user: { id: 1, email: 'a@b.com' } },
    })
    renderButton()
    await userEvent.click(screen.getByRole('button', { name: /google/i }))
    await waitFor(() =>
      expect(localStorage.getItem('om.accessToken')).toBe('app-jwt'),
    )
    expect(localStorage.getItem('om.accessToken')).not.toBe(
      'fake-google-id-token',
    )
  })

  it('reports an error message when the backend rejects the token', async () => {
    api.post.mockRejectedValueOnce({
      response: { data: { message: 'GOOGLE_TOKEN_INVALID' } },
    })
    const onError = vi.fn()
    renderButton({ onError })
    await userEvent.click(screen.getByRole('button', { name: /google/i }))
    await waitFor(() => expect(onError).toHaveBeenCalled())
    expect(localStorage.getItem('om.accessToken')).toBeNull()
  })
})
