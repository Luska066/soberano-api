// Components
import { Form, Head } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { login } from '@/routes';
import { email } from '@/routes/password';

export default function ForgotPassword({ status }: { status?: string }) {
    return (
        <>
            <Head title="Recuperar Senha — SoberanoAIM" />

            {status && (
                <div className="mb-4 rounded-md border border-green-500/30 bg-green-500/10 p-3 text-center text-xs font-medium text-green-400">
                    {status}
                </div>
            )}

            <div className="space-y-5">
                <Form {...email.form()}>
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label
                                    htmlFor="email"
                                    className="font-mono text-xs uppercase tracking-wider text-[#7a84a0]"
                                >
                                    E-mail Cadastrado
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    autoComplete="off"
                                    autoFocus
                                    placeholder="seu.email@exemplo.com"
                                    className="border-[#c9a227]/25 bg-[#07091a]/80 text-[#e4e6f0] placeholder:text-[#7a84a0]/50 focus:border-[#c9a227] focus:ring-1 focus:ring-[#c9a227]"
                                />

                                <InputError message={errors.email} />
                            </div>

                            <div className="mt-4 flex items-center justify-start">
                                <Button
                                    className="h-11 w-full border border-[#c9a227] bg-gradient-to-r from-[#c9a227] via-[#d4af37] to-[#a87d15] font-rajdhani text-base font-bold uppercase tracking-widest text-[#07091a] shadow-[0_0_20px_rgba(201,162,39,0.3)] transition-all hover:brightness-110 active:scale-[0.99] disabled:opacity-50"
                                    disabled={processing}
                                    data-test="email-password-reset-link-button"
                                >
                                    {processing ? (
                                        <span className="flex items-center gap-2">
                                            <LoaderCircle className="h-4 w-4 animate-spin" />
                                            Enviando link...
                                        </span>
                                    ) : (
                                        'Enviar Link de Recuperação →'
                                    )}
                                </Button>
                            </div>
                        </>
                    )}
                </Form>

                <div className="space-x-1 text-center text-xs text-[#7a84a0]">
                    <span>Ou volte para o</span>
                    <TextLink
                        href={login()}
                        className="font-semibold text-[#c9a227] hover:underline"
                    >
                        login
                    </TextLink>
                </div>
            </div>
        </>
    );
}

ForgotPassword.layout = {
    title: 'RECUPERAR SENHA',
    description: 'Informe seu e-mail para receber as instruções de recuperação',
};
