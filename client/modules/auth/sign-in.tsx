import {Button, Stack, TextField} from '@mui/material';
import {useRouter} from '@tanstack/react-router';
import {toast} from 'sonner';
import {getAPIClient} from '@/providers/api/api-client';
import {setSession} from '@/providers/auth/session';
import {notifyError} from '@/utils/notify';

const api = getAPIClient();

export default function SignIn() {
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    try {
      e.preventDefault();
      const form = e.target as HTMLFormElement;
      const formData = new FormData(form);
      const email = formData.get('email')?.toString() ?? '';
      const password = formData.get('password')?.toString() ?? '';
      const {session} = await api.auth.sign_in({email, password});
      setSession(session);
      toast.success('Signed in successfully');
      router.invalidate();
    } catch (error) {
      notifyError(['auth'], error, 'Failed to sign in.');
    }
  };

  return (
    <Stack sx={{p: 2, marginInline: 'auto', maxWidth: 400}} spacing={2}>
      <form onSubmit={onSubmit}>
        <TextField
          type="email"
          slotProps={{
            htmlInput: {
              required: true,
            },
          }}
          name="email"
          required
          label="Email"
          fullWidth
          margin="normal"
        />
        <TextField
          type="password"
          slotProps={{
            htmlInput: {
              required: true,
              minLength: 6,
            },
          }}
          name="password"
          required
          label="Password"
          fullWidth
          margin="normal"
        />
        <Button type="submit">Sign In</Button>
      </form>
    </Stack>
  );
}
