import { StyleSheet, View } from "react-native";

import { AppButton } from "@/components/base/AppButton";
import { Card } from "@/components/base/Card";
import { Notice } from "@/components/base/Notice";
import { TextField } from "@/components/base/TextField";
import { spacing } from "@/components/base/theme";
import type { Member } from "@/types";

import { ChoiceButton } from "./ChoiceButton";
import { SplitSection } from "./SplitSection";
import { useExpenseForm } from "./useExpenseForm";

export function ExpenseFormView({ gid, members }: { gid: string; members: Member[] }) {
  const { fields, split, error, busy, save } = useExpenseForm(gid, members);
  return (
    <View style={styles.content}>
      <Card>
        <TextField
          label="Descripcion"
          value={fields.descripcion}
          onChangeText={fields.setDescripcion}
          maxLength={80}
          placeholder="Mercado, taxi, cena..."
        />
        <TextField
          label="Monto en pesos"
          value={fields.pesos}
          onChangeText={fields.setPesos}
          keyboardType="number-pad"
          placeholder="50000"
        />
      </Card>
      <Card title="Quien pago">
        <View style={styles.choices}>
          {members.map((member) => (
            <ChoiceButton
              key={member.uid}
              label={member.nombre}
              accessibilityLabel={`Pago ${member.nombre}`}
              selected={fields.pagador === member.uid}
              onPress={() => fields.setPagador(member.uid)}
            />
          ))}
        </View>
      </Card>
      <SplitSection members={members} {...split} />
      {error ? <Notice tone="error">{error}</Notice> : null}
      <AppButton label="Guardar gasto" onPress={save} disabled={busy} />
    </View>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.medium },
  choices: { flexDirection: "row", gap: spacing.small, flexWrap: "wrap" },
});
