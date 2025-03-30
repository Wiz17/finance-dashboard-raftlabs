import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { fetcher } from '@/app/graphql/fetcher';
import { ADD_TRANSACTIONS, UPDATE_TRANSACTIONS } from '@/app/graphql/queries';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons';

interface Transaction {
  id: string;
  goal_id: string;
  amount: number;
  date: string;
  note?: string;
  type: 'income' | 'expense';
  category?: string;
  created_at: string;
}

interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
}

interface CategoryNode {
  node: Category;
}

interface AddTransactionDialogProps {
  handleTransactionAdd: (type: string, data: any) => void;
  handleTransactionUpdate?: (type: string, data: any) => void; // New prop for update
  triggerButton?: React.ReactNode;
  categories: CategoryNode[];
  transactionToEdit?: Transaction | null; // Transaction to edit
}

export function AddUpdateTransactions({ 
  handleTransactionAdd,
  handleTransactionUpdate,
  triggerButton,
  categories = [],
  transactionToEdit = null
}: AddTransactionDialogProps) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [categoryId, setCategoryId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Initialize form with transactionToEdit data when it changes
  useEffect(() => {
    if (transactionToEdit) {
      setAmount(transactionToEdit.amount.toString());
      setNote(transactionToEdit.note || '');
      setDate(transactionToEdit.date);
      setType(transactionToEdit.type);
      setCategoryId(transactionToEdit.category || '');
    } else {
      resetForm();
    }
  }, [transactionToEdit]);

  // Extract and filter categories based on selected type
  const filteredCategories = categories
    .map(catNode => catNode.node)
    .filter(cat => cat.type === type);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
        throw new Error('Please enter a valid amount');
      }

      if (!categoryId && filteredCategories.length > 0) {
        throw new Error('Please select a category');
      }

      const baseVariables = {
        amount: String(amount),
        description: note || null,
        created_at: date || new Date().toISOString().split('T')[0],
        user_id: localStorage.getItem("user_id") || "",
        type,
        category_id: categoryId || null
      };

      if (transactionToEdit) {
        // Update existing transaction
        const variables = {
          ...baseVariables,
          id: transactionToEdit.id
        };

        const response = await fetcher(UPDATE_TRANSACTIONS, variables);

        if (!response?.updateTransactionsCollection?.records?.[0]) {
          throw new Error('Failed to update transaction');
        }

        const updatedTransaction = response.updateTransactionsCollection.records[0];
        handleTransactionUpdate?.(type, updatedTransaction);
      } else {
        // Create new transaction
        const response = await fetcher(ADD_TRANSACTIONS, baseVariables);

        if (!response?.insertIntoTransactionsCollection?.records?.[0]) {
          throw new Error('Failed to create transaction');
        }

        const newTransaction = response.insertIntoTransactionsCollection.records[0];
        handleTransactionAdd(type, newTransaction);
      }

      setOpen(false);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process transaction');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setAmount('');
    setNote('');
    setDate('');
    setType('expense');
    setCategoryId('');
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton || (
            !transactionToEdit ?
          <Button size="sm">
            Add Transaction
          </Button> : 
          <Button>
          <FontAwesomeIcon icon={faEdit} className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {transactionToEdit ? 'Edit Transaction' : 'Add Transaction'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Transaction Type Dropdown */}
          <div>
            <Label>Transaction Type</Label>
            <Select 
              value={type} 
              onValueChange={(value: 'income' | 'expense') => setType(value)}
              disabled={!!transactionToEdit} // Disable for editing existing transactions
            >
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Category Dropdown */}
          {filteredCategories.length > 0 && (
            <div>
              <Label>Category</Label>
              <Select 
                value={categoryId} 
                onValueChange={(value) => setCategoryId(value)}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {filteredCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Amount Input */}
          <div>
            <Label>Amount (INR)</Label>
            <Input 
              type="number" 
              value={amount} 
              onChange={(e) => setAmount(e.target.value)} 
              required 
              min="0.01" 
              step="0.01" 
              placeholder="Enter amount"
              className="mt-2"
            />
          </div>

          {/* Note Input */}
          <div>
            <Label>Description</Label>
            <Input 
              value={note} 
              onChange={(e) => setNote(e.target.value)} 
              placeholder="Transaction Description"
              className="mt-2"
            />
          </div>

          {/* Date Input */}
          <div>
            <Label>Date</Label>
            <Input 
              type="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)} 
              max={new Date().toISOString().split('T')[0]}
              className="mt-2"
            />
          </div>
          
          {error && <p className="text-red-500 text-sm">{error}</p>}
          
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? 'Processing...' : transactionToEdit ? 'Update Transaction' : 'Add Transaction'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}