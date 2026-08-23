import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasskeyVerify from '@/components/passkey-verify';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

type Props = {
    status?: string;
    canResetPassword: boolean;
};

export default function Login({ status, canResetPassword }: Props) {
    return (
        <>
            <Head title="Área do Cliente — SoberanoAIM" />

            <PasskeyVerify />

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-5"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label
                                    htmlFor="email"
                                    className="font-mono text-xs uppercase tracking-wider text-[#7a84a0]"
                                >
                                    E-mail
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="email"
                                    placeholder="seu.email@exemplo.com"
                                    className="border-[#c9a227]/25 bg-[#07091a]/80 text-[#e4e6f0] placeholder:text-[#7a84a0]/50 focus:border-[#c9a227] focus:ring-1 focus:ring-[#c9a227]"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <div className="flex items-center justify-between">
                                    <Label
                                        htmlFor="password"
                                        className="font-mono text-xs uppercase tracking-wider text-[#7a84a0]"
                                    >
                                        Senha
                                    </Label>
                                    {canResetPassword && (
                                        <TextLink
                                            href={request()}
                                            className="font-mono text-xs text-[#7a84a0] transition-colors hover:text-[#c9a227]"
                                            tabIndex={5}
                                        >
                                            Esqueceu a senha?
                                        </TextLink>
                                    )}
                                </div>
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    placeholder="••••••••••••"
                                    className="border-[#c9a227]/25 bg-[#07091a]/80 text-[#e4e6f0] placeholder:text-[#7a84a0]/50 focus:border-[#c9a227] focus:ring-1 focus:ring-[#c9a227]"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="flex items-center space-x-2 pt-1">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    tabIndex={3}
                                    className="border-[#c9a227]/40 data-[state=checked]:bg-[#c9a227] data-[state=checked]:text-[#07091a]"
                                />
                                <Label
                                    htmlFor="remember"
                                    className="cursor-pointer font-sans text-xs text-[#7a84a0]"
                                >
                                    Lembrar de mim
                                </Label>
                            </div>

                            <Button
                                type="submit"
                                className="mt-2 h-11 w-full border border-[#c9a227] bg-gradient-to-r from-[#c9a227] via-[#d4af37] to-[#a87d15] font-rajdhani text-base font-bold uppercase tracking-widest text-[#07091a] shadow-[0_0_20px_rgba(201,162,39,0.3)] transition-all hover:brightness-110 active:scale-[0.99] disabled:opacity-50"
                                tabIndex={4}
                                disabled={processing}
                                data-test="login-button"
                            >
                                {processing ? (
                                    <span className="flex items-center gap-2">
                                        <Spinner className="size-4" />
                                        Autenticando...
                                    </span>
                                ) : (
                                    'Entrar →'
                                )}
                            </Button>
                        </div>

                        <div className="pt-2 text-center text-xs text-[#7a84a0]">
                            Ainda não tem conta?{' '}
                            <TextLink
                                href={register()}
                                tabIndex={5}
                                className="font-semibold text-[#c9a227] underline decoration-[#c9a227]/40 hover:decoration-[#c9a227]"
                            >
                                Adquirir licença
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>

            {status && (
                <div className="mt-4 rounded-md border border-green-500/30 bg-green-500/10 p-3 text-center text-xs font-medium text-green-400">
                    {status}
                </div>
            )}
        </>
    );
}

Login.layout = {
    title: 'ÁREA DO CLIENTE',
    description: 'Acesse sua conta SoberanoAIM',
};
