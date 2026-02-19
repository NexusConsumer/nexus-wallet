import { useRouteError, useNavigate, useParams, isRouteErrorResponse } from 'react-router-dom';

export default function ErrorBoundary() {
  const error = useRouteError();
  const navigate = useNavigate();
  const { lang = 'he' } = useParams();

  const message =
    isRouteErrorResponse(error)
      ? `${error.status} ${error.statusText}`
      : error instanceof Error
      ? error.message
      : String(error);

  const stack = error instanceof Error ? error.stack : undefined;

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-border p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-error/10 flex items-center justify-center flex-shrink-0">
            <span
              className="material-symbols-outlined text-error"
              style={{ fontSize: '20px' }}
            >
              error
            </span>
          </div>
          <div>
            <h1 className="text-sm font-bold text-text-primary">משהו השתבש</h1>
            <p className="text-xs text-text-muted">Something went wrong</p>
          </div>
        </div>

        <div className="bg-error/5 border border-error/20 rounded-xl p-3">
          <p className="text-xs font-mono text-error break-all">{message}</p>
          {stack && (
            <details className="mt-2">
              <summary className="text-[10px] text-text-muted cursor-pointer">Stack trace</summary>
              <pre className="text-[9px] text-text-muted mt-1 overflow-auto max-h-40 whitespace-pre-wrap">{stack}</pre>
            </details>
          )}
        </div>

        <button
          onClick={() => navigate(`/${lang ?? 'he'}`)}
          className="w-full py-3 rounded-xl bg-primary text-white text-sm font-semibold active:scale-[0.98] transition-all"
        >
          חזור לדף הבית
        </button>
      </div>
    </div>
  );
}
