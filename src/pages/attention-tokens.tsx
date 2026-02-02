/**
 * Attention Tokens Page
 * Market discovery for treatment-specific tokens
 */

import { AttentionTokenMarket } from '../components/AttentionTokenMarket';
import { withErrorBoundary } from '../components/ErrorBoundaryWrapper';

function AttentionTokens() {
  return (
    <div className="min-h-screen">
      <AttentionTokenMarket />
    </div>
  );
}

export default withErrorBoundary(AttentionTokens, 'AttentionTokens');
