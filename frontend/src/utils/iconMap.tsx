import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import CategoryRoundedIcon from '@mui/icons-material/CategoryRounded';
import CurrencyExchangeRoundedIcon from '@mui/icons-material/CurrencyExchangeRounded';
import DevicesRoundedIcon from '@mui/icons-material/DevicesRounded';
import DirectionsCarRoundedIcon from '@mui/icons-material/DirectionsCarRounded';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import GavelRoundedIcon from '@mui/icons-material/GavelRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import LaptopMacRoundedIcon from '@mui/icons-material/LaptopMacRounded';
import PaidRoundedIcon from '@mui/icons-material/PaidRounded';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import RestaurantRoundedIcon from '@mui/icons-material/RestaurantRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import ShoppingBagRoundedIcon from '@mui/icons-material/ShoppingBagRounded';
import SportsEsportsRoundedIcon from '@mui/icons-material/SportsEsportsRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import type { SvgIconComponent } from '@mui/icons-material';

const iconMap: Record<string, SvgIconComponent> = {
  payments: PaymentsRoundedIcon,
  laptop_mac: LaptopMacRoundedIcon,
  trending_up: TrendingUpRoundedIcon,
  shopping_bag: ShoppingBagRoundedIcon,
  currency_exchange: CurrencyExchangeRoundedIcon,
  paid: PaidRoundedIcon,
  restaurant: RestaurantRoundedIcon,
  home: HomeRoundedIcon,
  directions_car: DirectionsCarRoundedIcon,
  favorite: FavoriteRoundedIcon,
  school: SchoolRoundedIcon,
  sports_esports: SportsEsportsRoundedIcon,
  devices: DevicesRoundedIcon,
  receipt_long: ReceiptLongRoundedIcon,
  gavel: GavelRoundedIcon,
  category: CategoryRoundedIcon,
};

export function getIconComponent(iconName: string) {
  return iconMap[iconName] ?? AccountBalanceWalletRoundedIcon;
}

export const availableIcons = Object.keys(iconMap);
