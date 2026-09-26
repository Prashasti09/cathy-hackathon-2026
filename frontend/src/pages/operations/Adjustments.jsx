// Owner: Prashasti (Prashasti09) - frontend UI
// Adjustments and internal transfers reuse the shared list/form screens.
import OperationList from '../../components/OperationList.jsx';
import OperationForm from '../../components/OperationForm.jsx';

export default function Adjustments() {
  return <OperationList type="ADJ" />;
}
export const AdjustmentForm = () => <OperationForm type="ADJ" />;
export const TransferList = () => <OperationList type="INT" />;
export const TransferForm = () => <OperationForm type="INT" />;
