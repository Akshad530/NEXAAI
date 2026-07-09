import { SafeAreaView, Text, View } from 'react-native';

export default function App() {
  return (
    // SafeAreaView prevents content from hiding behind the notch or status bar
    <SafeAreaView className="flex-1 w-full h-full bg-red-500 dark:bg-black">
      <View className="flex-1 w-full items-center justify-center">
        {/* Uses double quotes and clean spacing for the compiler */}
        <Text className="text-3xl text-black dark:text-white font-bold text-center">
          Hello World
        </Text>
      </View>
    </SafeAreaView>
  );
}
