<?php

namespace App\Http\Middleware;

use App\Enums\TypeUser;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsAdmin
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user() || ! $request->user()->isAdmin()) {
            return redirect()->route('dashboard');
        }

        return $next($request);
    }
}
