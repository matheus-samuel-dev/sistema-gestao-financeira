import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmDialog({ open, title, description, onCancel, onConfirm }: ConfirmDialogProps) {
  return (
    <Dialog
      aria-describedby="confirm-dialog-description"
      aria-labelledby="confirm-dialog-title"
      maxWidth="xs"
      onClose={onCancel}
      open={open}
      fullWidth
    >
      <DialogTitle id="confirm-dialog-title">{title}</DialogTitle>
      <DialogContent>
        <Typography color="text.secondary" id="confirm-dialog-description" variant="body2">
          {description}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button color="inherit" onClick={onCancel}>
          Cancelar
        </Button>
        <Button color="error" onClick={onConfirm} variant="contained">
          Confirmar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
