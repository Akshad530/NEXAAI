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
    primary: '#1D1D1D',
    background: '#F5F5F5',
    card: '#FFFFFF',
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
                backgroundColor: '#F5F5F5',
                width: 298,
                borderRightWidth: 1,
                borderRightColor: '#E8E8E8',
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
