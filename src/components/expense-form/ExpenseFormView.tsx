import { ScrollView, StyleSheet, View } from "react-native";

import { AppButton } from "@/components/base/AppButton";
import { AppText } from "@/components/base/AppText";
import { TextField } from "@/components/base/TextField";
import type { Member } from "@/types";

import { ChoiceButton } from "./ChoiceButton";
import { SplitSection } from "./SplitSection";
import { useExpenseForm } from "./useExpenseForm";

export function ExpenseFormView({ gid, members }: { gid: string; members: Member[] }) {
  const { fields, split, error, busy, save } = useExpenseForm(gid, members);
  return (
    <ScrollView contentContainerStyle={styles.content}>
      <TextField
        label="Descripcion"
        value={fields.descripcion}
        onChangeText={fields.setDescripcion}
        maxLength={80}
      />
      <TextField
        label="Monto en pesos"
        value={fields.pesos}
        onChangeText={fields.setPesos}
        keyboardType="number-pad"
      />
      <AppText>Quien pago</AppText>
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
      <SplitSection members={members} {...split} />
      {error ? <AppText variant="error">{error}</AppText> : null}
      <AppButton label="Guardar gasto" onPress={save} disabled={busy} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { gap: 16 },
  choices: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
});
