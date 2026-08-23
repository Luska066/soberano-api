import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { login } from '@/routes';
import { store } from '@/routes/register';

type Props = {
    passwordRules: string;
};

export default function Register({ passwordRules }: Props) {
    return (
        <>
            <Head title="Criar Conta — SoberanoAIM" />
            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="flex flex-col gap-5"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label
                                    htmlFor="name"
                                    className="font-mono text-xs uppercase tracking-wider text-[#7a84a0]"
                                >
                                    Nome Completo
                                </Label>
                                <Input
                                    id="name"
                                    type="text"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="name"
                                    name="name"
                                    placeholder="Seu nome"
                                    className="border-[#c9a227]/25 bg-[#07091a]/80 text-[#e4e6f0] placeholder:text-[#7a84a0]/50 focus:border-[#c9a227] focus:ring-1 focus:ring-[#c9a227]"
                                />
                                <InputError
                                    message={errors.name}
                                    className="mt-1"
                                />
                            </div>

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
                                    required
                                    tabIndex={2}
                                    autoComplete="email"
                                    name="email"
                                    placeholder="seu.email@exemplo.com"
                                    className="border-[#c9a227]/25 bg-[#07091a]/80 text-[#e4e6f0] placeholder:text-[#7a84a0]/50 focus:border-[#c9a227] focus:ring-1 focus:ring-[#c9a227]"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <Label
                                    htmlFor="password"
                                    className="font-mono text-xs uppercase tracking-wider text-[#7a84a0]"
                                >
                                    Senha
                                </Label>
                                <PasswordInput
                                    id="password"
                                    required
                                    tabIndex={3}
                                    autoComplete="new-password"
                                    name="password"
                                    placeholder="••••••••••••"
                                    passwordrules={passwordRules}
                                    className="border-[#c9a227]/25 bg-[#07091a]/80 text-[#e4e6f0] placeholder:text-[#7a84a0]/50 focus:border-[#c9a227] focus:ring-1 focus:ring-[#c9a227]"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="grid gap-2">
                                <Label
                                    htmlFor="password_confirmation"
                                    className="font-mono text-xs uppercase tracking-wider text-[#7a84a0]"
                                >
                                    Confirmar Senha
                                </Label>
                                <PasswordInput
                                    id="password_confirmation"
                                    required
                                    tabIndex={4}
                                    autoComplete="new-password"
                                    name="password_confirmation"
                                    placeholder="••••••••••••"
                                    passwordrules={passwordRules}
                                    className="border-[#c9a227]/25 bg-[#07091a]/80 text-[#e4e6f0] placeholder:text-[#7a84a0]/50 focus:border-[#c9a227] focus:ring-1 focus:ring-[#c9a227]"
                                />
                                <InputError
                                    message={errors.password_confirmation}
                                />
                            </div>

                            <Button
                                type="submit"
                                className="mt-2 h-11 w-full border border-[#c9a227] bg-gradient-to-r from-[#c9a227] via-[#d4af37] to-[#a87d15] font-rajdhani text-base font-bold uppercase tracking-widest text-[#07091a] shadow-[0_0_20px_rgba(201,162,39,0.3)] transition-all hover:brightness-110 active:scale-[0.99] disabled:opacity-50"
                                tabIndex={5}
                                data-test="register-user-button"
                            >
                                {processing ? (
                                    <span className="flex items-center gap-2">
                                        <Spinner className="size-4" />
                                        Criando conta...
                                    </span>
                                ) : (
                                    'Criar Minha Conta →'
                                )}
                            </Button>
                        </div>

                        <div className="pt-2 text-center text-xs text-[#7a84a0]">
                            Já tem uma conta?{' '}
                            <TextLink
                                href={login()}
                                tabIndex={6}
                                className="font-semibold text-[#c9a227] underline decoration-[#c9a227]/40 hover:decoration-[#c9a227]"
                            >
                                Fazer Login
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>
        </>
    );
}

Register.layout = {
    title: 'CRIAR CONTA',
    description: 'Preencha os dados abaixo para ativar sua licença',
};
