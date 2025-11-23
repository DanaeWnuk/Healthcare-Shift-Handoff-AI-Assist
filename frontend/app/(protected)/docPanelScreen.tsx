import DocsPanel from "@/components/DocumentationPanel";
import { View } from "react-native";

export default function docPanelScreen(props: { patient: any }) {
    return (
        <View style={{ padding: 20 }}>
            <DocsPanel selectedPatient={props.patient} />
        </View>
    );
}