import { View } from "react-native";

import type { SuggestedPayment } from "@/domain/settle";
import type { Member } from "@/types";

import { PaymentConfirm } from "./PaymentConfirm";
import { SuggestedPayments } from "./SuggestedPayments";

type Props = {
  members: Member[];
  suggested: SuggestedPayment[];
  selected: SuggestedPayment | null;
  onSelect: (payment: SuggestedPayment) => void;
  onConfirm: () => void;
  onCancel: () => void;
};

// Pagos sugeridos y, si el usuario eligio uno, la confirmacion para registrarlo.
export function PaymentsSection({ members, suggested, selected, ...handlers }: Props) {
  return (
    <View>
      <SuggestedPayments members={members} suggested={suggested} onSelect={handlers.onSelect} />
      {selected ? (
        <PaymentConfirm
          members={members}
          payment={selected}
          onConfirm={handlers.onConfirm}
          onCancel={handlers.onCancel}
        />
      ) : null}
    </View>
  );
}
