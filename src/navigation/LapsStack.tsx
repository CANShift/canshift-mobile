import {
  createNativeStackNavigator,
  type NativeStackScreenProps,
} from "@react-navigation/native-stack";
import LapsScreen from "../screens/LapsScreen";
import SessionsScreen from "../screens/SessionsScreen";
import SessionDetailScreen from "../screens/SessionDetailScreen";
import { UiColors } from "../theme/ui-tokens";

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
type LapsStackParamList = {
  LapsHome: undefined;
  Sessions: undefined;
  SessionDetail: { sessionKey: string };
};

const Stack = createNativeStackNavigator<LapsStackParamList>();

const LapsHome = ({
  navigation,
}: NativeStackScreenProps<LapsStackParamList, "LapsHome">) => (
  <LapsScreen
    onOpenHistory={() => {
      navigation.navigate("Sessions");
    }}
  />
);

const Sessions = ({
  navigation,
}: NativeStackScreenProps<LapsStackParamList, "Sessions">) => (
  <SessionsScreen
    onBack={navigation.goBack}
    onOpen={(sessionKey) => {
      navigation.navigate("SessionDetail", { sessionKey });
    }}
  />
);

const SessionDetail = ({
  navigation,
  route,
}: NativeStackScreenProps<LapsStackParamList, "SessionDetail">) => (
  <SessionDetailScreen
    sessionKey={route.params.sessionKey}
    onBack={navigation.goBack}
  />
);

const LapsStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      contentStyle: { backgroundColor: UiColors.bg },
    }}
  >
    <Stack.Screen name="LapsHome" component={LapsHome} />
    <Stack.Screen name="Sessions" component={Sessions} />
    <Stack.Screen name="SessionDetail" component={SessionDetail} />
  </Stack.Navigator>
);

export default LapsStack;
