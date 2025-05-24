import { ErrorText, Panel, PrimaryButton, TextInput } from '@/components/ui';
import { useToast } from '@/components/ui/Toast';
import useAuth from '@/hooks/useAuth';
import useTenant from '@/hooks/useTenant';
import { cn } from '@/utils/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import salesyncLogo from 'assets/salesync_logo.png';
import salesyncIcon from 'assets/salesync_icon.png';
import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { z } from 'zod';

const loginSchema = z.object({
  username: z.string().email('Invalid email'),
  password: z.string()
});

type LoginSchemaType = z.infer<typeof loginSchema>;

const LogIn = () => {
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const navigate = useNavigate();
  const companyName = useTenant();
  if (!companyName) {
    useEffect(() => {
      navigate('/');
    })
    return;
  }

  const { toast } = useToast();
  if (localStorage.getItem('theme') === 'dark' || document.documentElement.classList.contains('dark')) {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  }
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting }
  } = useForm<LoginSchemaType>({
    defaultValues: {
      username: '',
      password: ''
    },
    mode: 'all',
    resolver: zodResolver(loginSchema)
  });

  // const errorText = `Please check your username and password. If you still can't log in, contact your Salesforce administrator.`;

  const loginRef = useRef<HTMLDivElement>(null);
  const signupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const adjustSignupRefHeight = () => {
      if (loginRef.current && signupRef.current) {
        const loginHeight = loginRef.current.offsetHeight;
        signupRef.current.style.height = `${loginHeight}px`;
      }
    };
    adjustSignupRefHeight();
    window.addEventListener('resize', adjustSignupRefHeight);
    return () => {
      window.removeEventListener('resize', adjustSignupRefHeight);
    };
  }, []);

  const onSubmit = async (data: LoginSchemaType) => {
    try {
      await login({ companyName: companyName, email: data.username, password: data.password });
      toast({
        title: 'Success',
        description: 'You have successfully logged in'
      });

      navigate(searchParams.get('redirectUrl') ?? `/private/section/home`);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (error?.response?.data) {
        setError(error.response.data.type, { message: error.response.data.message });
      }

      toast({
        title: 'Error',
        description:
          "Please check your username and password. If you still can't log in, contact your SalesSync administrator.",
        variant: 'destructive'
      });
    }
  };

  return (
    <div className='h-full overflow-auto bg-white/80 bg-cover dark:bg-primary/60'>
      <div className='grid w-full md:grid-cols-1 lg:grid-cols-1'>
        <section ref={loginRef} className='flex min-h-screen w-full flex-col  items-center justify-between'>
          <div className='min-[calc(100%-10px)] mx-auto my-auto w-full grid-cols-1'>
            <div className='mt-5 flex h-fit w-full items-center justify-center'>
              <img
                src={salesyncLogo}
                className={cn(
                  'w-[340px] object-contain dark:hidden',
                  'transition-all duration-200 ease-in-out hover:scale-105'
                )}
                alt='header icon'
              />
              <img
                src={salesyncIcon}
                className={cn(
                  'hidden w-[80px] object-contain dark:block',
                  'transition-all duration-200 ease-in-out hover:scale-105'
                )}
                alt='header icon'
              />
            </div>
            <Panel className='mx-auto mb-20 flex w-fit justify-center px-2 py-2'>
              <form onSubmit={handleSubmit(onSubmit)} className='h-auto w-96 rounded-sm p-5'>
                <TextInput
                  placeholder='Enter your username'
                  header='Username'
                  register={register}
                  name='username'
                  className='h-12 w-full'
                  isError={!!errors.username}
                />
                {errors.username && <ErrorText text={errors.username.message} className='text-sm' />}
                <TextInput
                  placeholder='Enter password'
                  type='password'
                  header='Password'
                  register={register}
                  name='password'
                  className='h-12 w-full'
                  isError={!!errors.password}
                />
                {errors.password && <ErrorText text={errors.password.message} className='text-sm' />}

                <PrimaryButton className='mt-5 h-12 w-full' type='submit' disabled={isSubmitting}>
                  {isSubmitting ? 'Logging in...' : 'Log In'}
                </PrimaryButton>
              </form>
            </Panel>
          </div>
          <div className='mx-auto mb-4 w-full text-center text-sm dark:text-text-light'>
            ©2024 SaleSync, Inc. All rights reserved.
          </div>
        </section>
      </div>
    </div>
  );
};

export default LogIn;
