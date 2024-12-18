"use client"

import { Input } from '@/components/ui/input';
import { signIn, useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getEnv } from '@/components/auth/actions'
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { useEffect } from 'react';

const Signin = () => {
  const { status } = useSession();
  const router = useRouter();
  const t = useTranslations('common');
  const { toast } = useToast();
  
  let redirectAfterSignIn= ""
  useEffect(() => {
    async function authenticate() {
      redirectAfterSignIn = await (await getEnv()).REDIRECT_AFTER_SIGNIN
      if (status === 'authenticated') {
        router.push(redirectAfterSignIn);
      }
    }
    authenticate()

  }, [status])

  const methods = useForm<{ email: string; password: string }>({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: { email: string; password: string }) => {
    const { email, password } = data;
    const response = await signIn('credentials', {
      email,
      password,
      // csrfToken,
      redirect: true,
      redirecTo: redirectAfterSignIn,
    });

    methods.reset();

    if (!response?.ok) {
      toast({ title: t('signin-error') });
      return;
    }
  };

  return (
    <>
      <div className="rounded-md bg-white p-6 shadow-sm">
        <Form {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
            {/* Email Field */}
            <FormField
              name="email"
              control={methods.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('email')}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder={t('email-placeholder')}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Password Field */}
            <FormField
              name="password"
              control={methods.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('password')}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="password"
                      placeholder={t('password-placeholder')}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Forgot Password Link */}
            <p className="text-sm text-gray-600 text-right">
              <Link href="/auth/forgot-password">
                <span className="font-medium text-indigo-600 hover:text-indigo-500">
                  {t('forgot-password')}
                </span>
              </Link>
            </p>
            {/* Submit Button */}
            <Button type="submit" className="w-full">
              {t('sign-in')}
            </Button>
          </form>
        </Form>
        <div className="divider"></div>
        <div className="space-y-3">
          <Link href="/auth/magic-link">
            <Button variant="outline" className="w-full">
              {t('sign-in-with-email')}
            </Button>
          </Link>
        </div>
      </div>
      <p className="text-center text-sm text-gray-600">
        {t('dont-have-an-account')}
        <Link href="/auth/signup">
          <span className="font-medium text-indigo-600 hover:text-indigo-500">
            {t('create-a-free-account')}
          </span>
        </Link>
      </p>
    </>
  );
};

export default Signin;
