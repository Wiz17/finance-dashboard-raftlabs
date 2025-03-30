import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { fetcher } from "@/app/graphql/fetcher";
import { DELETE_TRANSACTIONS } from "@/app/graphql/queries";
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AddUpdateTransactions } from "./AddUpdateTransactions";
interface TransactionCardProps {
  id: string;
  category?: string;
  description?: string;
  transactionType?: "income" | "expense";
  amount?: number;
  handleTransactionDelete: (id:string,type:string,amount:number) => void; // Callback for successful deletion
}

const TransactionCard = ({
  id,
  category = "food",
  description = "buy kfc chicken",
  transactionType = "expense",
  amount = 1000,
  handleTransactionDelete,
}: TransactionCardProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const amountColor = transactionType === "income" ? "text-green-600" : "text-red-600";
  const amountSign = transactionType === "income" ? "+" : "-";
  const amountDisplay = `${amountSign}₹${Math.abs(amount).toLocaleString()}`;

  const handleDelete = async () => {
    setIsDeleting(true);
    setDeleteError('');
    
    try {
      const variables = { id };
      const response = await fetcher(DELETE_TRANSACTIONS, variables);
      
      if (!response?.deleteFromTransactionsCollection?.records?.[0]?.id) {
        throw new Error('Failed to delete transaction');
      }
      
      handleTransactionDelete(id,transactionType,amount);
      setShowDeleteDialog(false);
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : 'Deletion failed');
      console.error('Delete error:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="border-b border-gray-200 pb-3">
  <div className="flex flex-col gap-3 p-4 rounded-lg hover:bg-gray-50 transition-colors duration-200">
    {/* Top Row - Content */}
    <div className="flex items-center justify-between gap-3">
      {/* Category Info */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <Avatar className="h-10 w-10">
          <AvatarImage 
            src={`/icons/${category}.png`} 
            alt={category}
            className="object-cover"
          />
          <AvatarFallback className="bg-gray-100 text-gray-600">
            {category.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <h3 className="font-medium text-gray-900 truncate">{category}</h3>
          <p className="text-sm text-gray-500 truncate">{description}</p>
        </div>
      </div>

      {/* Amount */}
      <div className={`font-semibold text-base ${amountColor}`}>
        {amountDisplay}
      </div>
    </div>

    

    {/* Side Actions (desktop) */}
    <div className=" flex items-center gap-1">
      <button 
        className="text-gray-400 hover:text-blue-500 transition-colors p-2 rounded-full hover:bg-blue-50"
        // onClick={() => setShowEditDialog(true)}
        aria-label="Edit transaction"
      >
        <FontAwesomeIcon icon={faEdit} className="h-4 w-4" />
      </button>
      <button 
        className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50"
        onClick={() => setShowDeleteDialog(true)}
        aria-label="Delete transaction"
        disabled={isDeleting}
      >
        <FontAwesomeIcon icon={faTrashAlt} className="h-4 w-4" />
      </button>
    </div>
  </div>
</div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-[90vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this {amountSign}₹{Math.abs(amount).toLocaleString()} transaction?
            </DialogDescription>
          </DialogHeader>
          {deleteError && (
            <p className="text-red-500 text-sm">{deleteError}</p>
          )}
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={isDeleting}
              className="w-full sm:w-auto"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TransactionCard;