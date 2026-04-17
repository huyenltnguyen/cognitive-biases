import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

const HomePage = lazy(() => import('./pages/HomePage'));
const LessonPage = lazy(() => import('./pages/LessonPage'));
const CompletePage = lazy(() => import('./pages/CompletePage'));

function LoadingFallback() {
  return (
    <div role="status" aria-label="Loading" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <span className="sr-only">Loading...</span>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Suspense fallback={<LoadingFallback />}><HomePage /></Suspense>} />
      <Route path="/course/complete" element={<Suspense fallback={<LoadingFallback />}><CompletePage /></Suspense>} />
      <Route path="/course/:lessonId" element={<Suspense fallback={<LoadingFallback />}><LessonPage /></Suspense>} />
      <Route path="*" element={<Suspense fallback={<LoadingFallback />}><HomePage /></Suspense>} />
    </Routes>
  );
}