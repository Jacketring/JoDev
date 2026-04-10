import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useEffectEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import AppShell from './AppShell';
import ClientShell from './ClientShell';
import LoginPage from './LoginPage';
import { fetchCurrentUser, login, logout } from '../services/crmApi';

export default function AppRoot() {
    const queryClient = useQueryClient();
    const location = useLocation();
    const navigate = useNavigate();

    const authQuery = useQuery({
        queryKey: ['auth', 'user'],
        queryFn: fetchCurrentUser,
        retry: false,
        staleTime: 300_000,
    });

    const loginMutation = useMutation({
        mutationFn: login,
        onSuccess: (user) => {
            queryClient.setQueryData(['auth', 'user'], user);

            queryClient.removeQueries({
                predicate: (query) => query.queryKey[0] !== 'auth',
            });
        },
    });

    const resetSession = useEffectEvent(async () => {
        await queryClient.cancelQueries();
        queryClient.setQueryData(['auth', 'user'], null);
        queryClient.removeQueries({
            predicate: (query) => query.queryKey[0] !== 'auth',
        });
        navigate('/login', { replace: true });
    });

    const logoutMutation = useMutation({
        mutationFn: logout,
        onSuccess: resetSession,
        onError: resetSession,
    });

    const handleUnauthorized = useEffectEvent(() => {
        queryClient.setQueryData(['auth', 'user'], null);
        queryClient.removeQueries({
            predicate: (query) => query.queryKey[0] !== 'auth',
        });
        navigate('/login', { replace: true });
    });

    useEffect(() => {
        window.addEventListener('jodev:unauthorized', handleUnauthorized);

        return () => {
            window.removeEventListener('jodev:unauthorized', handleUnauthorized);
        };
    }, [handleUnauthorized]);

    if (authQuery.isPending) {
        return <LoadingScreen />;
    }

    const user = authQuery.data;
    const redirectTarget =
        location.state?.from?.pathname && location.state.from.pathname !== '/login'
            ? location.state.from.pathname
            : '/dashboard';

    if (!user && location.pathname !== '/login') {
        return <Navigate replace to="/login" state={{ from: location }} />;
    }

    if (!user) {
        return (
            <LoginPage
                isPending={loginMutation.isPending}
                error={loginMutation.error}
                onSubmit={(payload) => loginMutation.mutateAsync(payload)}
            />
        );
    }

    if (location.pathname === '/login') {
        return <Navigate replace to={redirectTarget} />;
    }

    const shellProps = {
        user,
        onLogout: () => logoutMutation.mutateAsync(),
        logoutPending: logoutMutation.isPending,
    };

    return user.role === 'cliente' ? <ClientShell {...shellProps} /> : <AppShell {...shellProps} />;
}

function LoadingScreen() {
    return (
        <div className="flex min-h-screen items-center justify-center px-4 py-10">
            <div className="panel-surface panel-enter w-full max-w-xl p-8 text-center">
                <p className="brand-chip mx-auto w-fit">JoDev CRM</p>
                <h1 className="mt-5 font-[var(--font-display)] text-4xl font-semibold tracking-tight text-[var(--color-ink)]">
                    Preparando tu espacio comercial
                </h1>
                <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-[var(--color-muted)]">
                    Validando la sesion y cargando el entorno de trabajo.
                </p>
            </div>
        </div>
    );
}
