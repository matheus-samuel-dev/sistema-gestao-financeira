import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TransactionFormDialog } from './TransactionFormDialog';

describe('TransactionFormDialog', () => {
  it('shows validation feedback and does not submit invalid payload', async () => {
    const onSubmit = vi.fn();

    render(
      <TransactionFormDialog
        open
        categories={[{
          id: 1,
          name: 'Infraestrutura',
          type: 'EXPENSE',
          color: '#0E7490',
          icon: 'devices',
          active: true,
          systemDefault: false,
        }]}
        onClose={vi.fn()}
        onSubmit={onSubmit}
      />,
    );

    fireEvent.change(screen.getByLabelText('Descrição'), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText('Valor'), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText('Forma de pagamento/recebimento'), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(await screen.findByText('Informe uma descrição com ao menos 3 caracteres.')).toBeInTheDocument();
    expect(screen.getByText('Informe um valor maior que zero.')).toBeInTheDocument();
    expect(screen.getByText('Informe a forma de pagamento ou recebimento.')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
