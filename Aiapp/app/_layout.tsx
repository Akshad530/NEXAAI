import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Drawer } from 'expo-router/drawer';
import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import HistoryChatsDrawer from '@/HistoryChatsDrawer';
import { ChatProvider } from '@/state/ChatProvider';

const appTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#7fb5ff',
    background: '#0B0B0F',
    card: '#0B0B0F',
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
              overlayColor: 'rgba(0,0,0,0.55)',
              drawerStyle: {
                backgroundColor: '#15151A',
                width: 298,
                borderRightWidth: 1,
                borderRightColor: '#2E2E37',
              },
            }}
          >
            <Drawer.Screen name="index" options={{ drawerLabel: 'Nexa AI' }} />
            <Drawer.Screen name="chat/[id]" options={{ drawerItemStyle: { display: 'none' } }} />
          </Drawer>
        </ChatProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
