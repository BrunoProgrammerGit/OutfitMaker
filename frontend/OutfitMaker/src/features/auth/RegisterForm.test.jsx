import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import RegisterForm from './RegisterForm'

vi.mock('../../lib/api', () => ({
  default: { post: vi.fn() },
}))

// GoogleLogin exige estar dentro de GoogleOAuthProvider; para estos tests
// basta un placeholder (GoogleAuthButton tiene su propio archivo de tests).
vi.mock('@react-oauth/google', () => ({
  GoogleLogin: () => <button type="button">Continuar con Google</button>,
}))

import api from '../../lib/api'

function renderForm() {
  const qc = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <RegisterForm />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('RegisterForm validations', () => {
  beforeEach(() => vi.clearAllMocks())

  it('blocks submit and marks all fields when empty', async () => {
    renderForm()
    await userEvent.click(screen.getByRole('button', { name: /crear cuenta/i }))
    expect(api.post).not.toHaveBeenCalled()
    expect(screen.getByText('El correo es obligatorio.')).toBeInTheDocument()
    expect(screen.getByText('La contraseña es obligatoria.')).toBeInTheDocument()
    expect(screen.getByText('Confirma tu contraseña.')).toBeInTheDocument()
  })

  it('shows error when email format is invalid', async () => {
    renderForm()
    await userEvent.type(screen.getByLabelText(/correo/i), 'notanemail')
    await userEvent.tab()
    expect(screen.getByText('Ingresa un correo válido.')).toBeInTheDocument()
  })

  it('shows error when password is too short', async () => {
    renderForm()
    await userEvent.type(screen.getByLabelText(/^contraseña$/i), '123')
    await userEvent.tab()
    expect(screen.getByText('Mínimo 8 caracteres.')).toBeInTheDocument()
  })

  it('shows error when passwords do not match', async () => {
    renderForm()
    await userEvent.type(screen.getByLabelText(/^contraseña$/i), 'password123')
    await userEvent.type(screen.getByLabelText(/confirmar/i), 'different123')
    await userEvent.tab()
    expect(screen.getByText('Las contraseñas no coinciden.')).toBeInTheDocument()
  })

  it('does not show errors before the user interacts with a field', () => {
    renderForm()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('marks email field as aria-invalid when email is missing', async () => {
    renderForm()
    await userEvent.click(screen.getByRole('button', { name: /crear cuenta/i }))
    expect(screen.getByLabelText(/correo/i)).toHaveAttribute('aria-invalid', 'true')
  })

  it('calls api.post with email and password on valid submit', async () => {
    api.post.mockResolvedValueOnce({ data: {} })
    renderForm()
    await userEvent.type(screen.getByLabelText(/correo/i), 'test@example.com')
    await userEvent.type(screen.getByLabelText(/^contraseña$/i), 'password123')
    await userEvent.type(screen.getByLabelText(/confirmar/i), 'password123')
    await userEvent.click(screen.getByRole('button', { name: /crear cuenta/i }))
    await waitFor(() =>
      expect(api.post).toHaveBeenCalledWith('/auth/register', {
        email: 'test@example.com',
        password: 'password123',
      }),
    )
  })

  it('shows "correo ya registrado" error from backend', async () => {
    api.post.mockRejectedValueOnce({
      response: { data: { message: 'EMAIL_ALREADY_REGISTERED' } },
    })
    renderForm()
    await userEvent.type(screen.getByLabelText(/correo/i), 'taken@example.com')
    await userEvent.type(screen.getByLabelText(/^contraseña$/i), 'password123')
    await userEvent.type(screen.getByLabelText(/confirmar/i), 'password123')
    await userEvent.click(screen.getByRole('button', { name: /crear cuenta/i }))
    await waitFor(() =>
      expect(screen.getByText('Este correo ya está registrado.')).toBeInTheDocument(),
    )
  })

  it('shows generic error for unknown backend errors', async () => {
    api.post.mockRejectedValueOnce({ response: { data: { message: 'UNKNOWN' } } })
    renderForm()
    await userEvent.type(screen.getByLabelText(/correo/i), 'test@example.com')
    await userEvent.type(screen.getByLabelText(/^contraseña$/i), 'password123')
    await userEvent.type(screen.getByLabelText(/confirmar/i), 'password123')
    await userEvent.click(screen.getByRole('button', { name: /crear cuenta/i }))
    await waitFor(() =>
      expect(screen.getByText(/ocurrió un error/i)).toBeInTheDocument(),
    )
  })
})
