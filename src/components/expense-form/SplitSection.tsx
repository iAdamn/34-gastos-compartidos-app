import { StyleSheet, View } from "react-native";

import { AppText } from "@/components/base/AppText";
import type { Member } from "@/types";

import { ChoiceButton } from "./ChoiceButton";
import { ParticipantRow } from "./ParticipantRow";
import { PERCENT_STEP, percentTotal, type Percents } from "./percents";
import { PercentRow } from "./PercentRow";
import type { SplitMode } from "./useExpenseForm";

type Props = {
  members: Member[];
  participantes: string[];
  toggle: (uid: string) => void;
  mode: SplitMode;
  chooseMode: (mode: SplitMode) => void;
  percents: Percents;
  changeOne: (uid: string, delta: number) => void;
};

// Entre quienes se divide el gasto y como: partes iguales o porcentajes.
export function SplitSection({ members, participantes, toggle, mode, chooseMode, ...rest }: Props) {
  const chosen = members.filter((member) => participantes.includes(member.uid));
  return (
    <View style={styles.section}>
      <AppText>Participantes: manten presionado un nombre o usa la casilla</AppText>
      {members.map((member) => (
        <ParticipantRow
          key={member.uid}
          member={member}
          checked={participantes.includes(member.uid)}
          onToggle={() => toggle(member.uid)}
        />
      ))}
      <View style={styles.choices}>
        <ChoiceButton
          label="Partes iguales"
          selected={mode === "iguales"}
          onPress={() => chooseMode("iguales")}
        />
        <ChoiceButton
          label="Porcentajes"
          selected={mode === "porcentajes"}
          onPress={() => chooseMode("porcentajes")}
        />
      </View>
      {mode === "porcentajes" ? <PercentList chosen={chosen} {...rest} /> : null}
    </View>
  );
}

type PercentListProps = Pick<Props, "percents" | "changeOne"> & { chosen: Member[] };

function PercentList({ chosen, percents, changeOne }: PercentListProps) {
  return (
    <View style={styles.section}>
      {chosen.map((member) => (
        <PercentRow
          key={member.uid}
          nombre={member.nombre}
          percent={percents[member.uid] ?? 0}
          step={PERCENT_STEP}
          onChange={(delta) => changeOne(member.uid, delta)}
        />
      ))}
      <AppText variant="muted">{`Suma: ${percentTotal(percents)} %`}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: 8 },
  choices: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
});
