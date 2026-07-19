import { GoogleLogin } from '@react-oauth/google'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import api from '../../lib/api'
import { setSession } from '../../lib/auth'

/**
 * Botón "Continuar con Google".
 *
 * Google Identity Services devuelve un ID token (credential) en el navegador.
 * NO lo usamos como sesión: lo mandamos al backend, que lo verifica contra
 * Google y responde con un JWT propio de la app. El Client Secret nunca toca
 * el frontend; aquí solo vive el Client ID (público).
 */
export default function GoogleAuthButton({ onError }) {
  const navigate = useNavigate()

  const mutation = useMutation({
    mutationFn: (credential) => api.post('/auth/google', { credential }),
    onSuccess: ({ data }) => {
      setSession(data.accessToken, data.user)
      navigate('/')
    },
    onError: () => onError?.('No pudimos iniciar sesión con Google. Inténtalo de nuevo.'),
  })

  return (
    <div className="google-auth" aria-busy={mutation.isPending}>
      <GoogleLogin
        onSuccess={(res) => mutation.mutate(res.credential)}
        onError={() =>
          onError?.('No pudimos conectar con Google. Inténtalo de nuevo.')
        }
        text="continue_with"
        shape="rectangular"
        width="360"
      />
    </div>
  )
}
