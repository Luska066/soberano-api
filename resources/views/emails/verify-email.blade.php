<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verificação de E-mail — SoberanoAIM</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            background-color: #07091a;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            color: #e4e6f0;
            -webkit-text-size-adjust: none;
        }
        .wrapper {
            width: 100%;
            background-color: #07091a;
            padding: 40px 15px;
        }
        .container {
            max-width: 560px;
            margin: 0 auto;
            background-color: #0d1228;
            border: 1px solid rgba(201, 162, 39, 0.3);
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        }
        .header {
            padding: 35px 30px 20px 30px;
            text-align: center;
            background: linear-gradient(180deg, rgba(201, 162, 39, 0.08) 0%, transparent 100%);
            border-bottom: 1px solid rgba(201, 162, 39, 0.15);
        }
        .logo-badge {
            display: inline-block;
            padding: 10px 20px;
            background: #07091a;
            border: 1px solid rgba(201, 162, 39, 0.5);
            border-radius: 8px;
            font-size: 18px;
            font-weight: 800;
            letter-spacing: 3px;
            color: #c9a227;
            text-transform: uppercase;
        }
        .content {
            padding: 35px 35px 25px 35px;
            line-height: 1.6;
        }
        .title {
            font-size: 22px;
            font-weight: 700;
            color: #ffffff;
            margin-top: 0;
            margin-bottom: 18px;
            letter-spacing: 0.5px;
        }
        .greeting {
            font-size: 15px;
            color: #e4e6f0;
            margin-bottom: 16px;
        }
        .text {
            font-size: 14px;
            color: #a4adcb;
            margin-bottom: 25px;
        }
        .button-wrapper {
            text-align: center;
            margin: 35px 0;
        }
        .button {
            display: inline-block;
            background: linear-gradient(135deg, #c9a227 0%, #d4af37 50%, #a87d15 100%);
            color: #07091a !important;
            text-decoration: none;
            padding: 14px 34px;
            font-size: 14px;
            font-weight: 800;
            letter-spacing: 1.5px;
            text-transform: uppercase;
            border-radius: 6px;
            border: 1px solid #c9a227;
            box-shadow: 0 4px 15px rgba(201, 162, 39, 0.35);
        }
        .note {
            font-size: 12px;
            color: #7a84a0;
            border-top: 1px solid rgba(201, 162, 39, 0.15);
            padding-top: 20px;
            margin-top: 30px;
        }
        .fallback {
            font-size: 11px;
            color: #5d6785;
            word-break: break-all;
            margin-top: 12px;
        }
        .fallback a {
            color: #c9a227;
            text-decoration: underline;
        }
        .footer {
            padding: 20px 30px;
            text-align: center;
            font-size: 11px;
            color: #5d6785;
            background-color: #080b1a;
            border-top: 1px solid rgba(201, 162, 39, 0.1);
        }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="container">
            <!-- Header -->
            <div class="header">
                <div class="logo-badge">
                    SOBERANO<span style="color: #ffffff;">AIM</span>
                </div>
            </div>

            <!-- Content -->
            <div class="content">
                <h1 class="title">Verificação de Endereço de E-mail</h1>
                
                <p class="greeting">Olá, <strong>{{ $user->name ?? 'Cliente' }}</strong>!</p>
                
                <p class="text">
                    Obrigado por se registrar no <strong>SoberanoAIM</strong>. Para ativar sua conta com total segurança e ter acesso à plataforma, confirme seu endereço de e-mail clicando no botão abaixo:
                </p>

                <div class="button-wrapper">
                    <a href="{{ $url }}" class="button" target="_blank">
                        Confirmar Meu E-mail
                    </a>
                </div>

                <p class="text" style="font-size: 13px; color: #7a84a0; text-align: center;">
                    Este link de confirmação é válido por <strong>60 minutos</strong>.
                </p>

                <div class="note">
                    <p style="margin: 0 0 8px 0;">
                        Se você não criou uma conta no SoberanoAIM, por favor ignore este e-mail. Nenhuma ação adicional é necessária.
                    </p>
                    <div class="fallback">
                        Se estiver com problemas para clicar no botão, copie e cole o link a seguir no seu navegador:<br>
                        <a href="{{ $url }}">{{ $url }}</a>
                    </div>
                </div>
            </div>

            <!-- Footer -->
            <div class="footer">
                © {{ date('Y') }} SoberanoAIM. Todos os direitos reservados.
            </div>
        </div>
    </div>
</body>
</html>
