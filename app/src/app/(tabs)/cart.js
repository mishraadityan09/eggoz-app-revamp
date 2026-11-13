import { selectItemCount, useCartStore } from '@/features/cart/cartStore';
import { PlaceholderScreen } from '@/ui/PlaceholderScreen';

export default function CartScreen() {
  const count = useCartStore(selectItemCount);
  const message =
    count === 0
      ? 'Your cart is empty. Guests can add items — login is only asked at checkout.'
      : `${count} item${count === 1 ? '' : 's'} saved in your guest cart. The full cart and checkout arrive in Milestone 4.`;
  return <PlaceholderScreen title="Cart" icon="cart-outline" message={message} />;
}
