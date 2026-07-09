import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Drawer } from 'expo-router/drawer';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import HistoryChatsDrawer from '@/HistoryChatsDrawer';
import { ChatProvider } from '@/state/ChatProvider';

const appTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#D97757',
    background: '#F9F6F2',
    card: '#F9F6F2',
  },
};

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={appTheme}>
        <ChatProvider>
          <Drawer
            drawerContent={(props) => <HistoryChatsDrawer {...props} />}
            screenOptions={{
              headerShown: false,
              overlayColor: 'rgba(0,0,0,0.15)',
              drawerStyle: {
                backgroundColor: '#F9F6F2',
                width: 298,
                borderRightWidth: 1,
                borderRightColor: '#E5E1DA',
              },
            }}
          >
            <Drawer.Screen name="index" options={{ drawerLabel: 'NEXA AI' }} />
            <Drawer.Screen name="chat/[id]" options={{ drawerItemStyle: { display: 'none' } }} />
          </Drawer>
        </ChatProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
