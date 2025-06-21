import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import {
    Button,
    FlatList,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableWithoutFeedback,
    useColorScheme,
    View,
} from 'react-native';

interface Entry {
  id: string;
  calories: number;
  protein: number;
  timestamp: string;
}

interface DailyTotal {
  date: string;
  totalCalories: number;
  totalProtein: number;
  entryCount: number;
}

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [entries, setEntries] = useState<Entry[]>([]);

  const backgroundColor = isDark ? '#0a0a12' : '#f8f9fa';
  const textColor = isDark ? '#ffffff' : '#000000';
  const inputBg = isDark ? '#1e1e2a' : '#ffffff';
  const blue = '#3b82f6';

  const getTodayKey = () => {
    const today = new Date();
    return `entries-${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
  };

  const getDateKey = (date: Date) => {
    return `entries-${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  };

  const getDailyTotalsKey = () => 'daily-totals';

  const compressPreviousDayEntries = async () => {
    try {
      // Get the last app usage date
      const lastUsageDate = await AsyncStorage.getItem('last-usage-date');
      const today = new Date();
      const todayString = today.toDateString();
      
      // If this is the first time using the app or same day, no compression needed
      if (!lastUsageDate || lastUsageDate === todayString) {
        await AsyncStorage.setItem('last-usage-date', todayString);
        return;
      }

      // Check if we need to compress yesterday's data
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayKey = getDateKey(yesterday);
      
      const yesterdayData = await AsyncStorage.getItem(yesterdayKey);
      if (yesterdayData) {
        const yesterdayEntries: Entry[] = JSON.parse(yesterdayData);
        
        if (yesterdayEntries.length > 0) {
          // Calculate totals
          const totalCalories = yesterdayEntries.reduce((sum, e) => sum + e.calories, 0);
          const totalProtein = yesterdayEntries.reduce((sum, e) => sum + e.protein, 0);
          
          // Create daily total object
          const dailyTotal: DailyTotal = {
            date: yesterday.toDateString(),
            totalCalories,
            totalProtein,
            entryCount: yesterdayEntries.length,
          };
          
          // Get existing daily totals
          const existingTotalsData = await AsyncStorage.getItem(getDailyTotalsKey());
          const existingTotals: DailyTotal[] = existingTotalsData ? JSON.parse(existingTotalsData) : [];
          
          // Add new daily total (avoid duplicates)
          const updatedTotals = existingTotals.filter(total => total.date !== dailyTotal.date);
          updatedTotals.push(dailyTotal);
          
          // Save compressed data and remove detailed entries
          await AsyncStorage.setItem(getDailyTotalsKey(), JSON.stringify(updatedTotals));
          await AsyncStorage.removeItem(yesterdayKey);
          
          console.log(`Compressed ${yesterdayEntries.length} entries from ${yesterday.toDateString()} into daily total`);
        }
      }
      
      // Update last usage date
      await AsyncStorage.setItem('last-usage-date', todayString);
    } catch (error) {
      console.error('Error compressing previous day entries:', error);
    }
  };

  const loadEntries = async () => {
    const todayKey = getTodayKey();
    const data = await AsyncStorage.getItem(todayKey);
    if (data) {
      setEntries(JSON.parse(data));
    }
  };

  const saveEntries = async (newEntries: Entry[]) => {
    const todayKey = getTodayKey();
    await AsyncStorage.setItem(todayKey, JSON.stringify(newEntries));
  };

  useEffect(() => {
    const initializeApp = async () => {
      await compressPreviousDayEntries();
      await loadEntries();
    };
    
    initializeApp();
  }, []);

  const handleSubmit = () => {
    const cal = parseFloat(calories);
    const pro = parseFloat(protein);
    
    // Require at least one field to have a value
    if (!calories && !protein) return;
    
    const newEntry: Entry = {
      id: Date.now().toString(),
      calories: calories && !isNaN(cal) ? cal : 0,
      protein: protein && !isNaN(pro) ? pro : 0,
      timestamp: new Date().toLocaleTimeString(),
    };

    const updated = [...entries, newEntry];
    setEntries(updated);
    saveEntries(updated);

    setCalories('');
    setProtein('');
    Keyboard.dismiss();
  };

  const totalCalories = entries.reduce((sum, e) => sum + e.calories, 0);
  const totalProtein = entries.reduce((sum, e) => sum + e.protein, 0);

  const EntryItem = ({ item }: { item: Entry }) => (
    <View style={[styles.entry, { backgroundColor: inputBg }]}>
      <Text style={{ color: textColor }}>
        {item.timestamp}: {item.calories} cal, {item.protein}g protein
      </Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor }]}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.inputSection}>
          <Text style={[styles.title, { color: textColor }]}>Macro Tracker</Text>

          <TextInput
            style={[styles.input, { backgroundColor: inputBg, color: textColor }]}
            keyboardType="numeric"
            placeholder="Calories"
            placeholderTextColor={isDark ? '#999' : '#666'}
            value={calories}
            onChangeText={setCalories}
          />

          <TextInput
            style={[styles.input, { backgroundColor: inputBg, color: textColor }]}
            keyboardType="numeric"
            placeholder="Protein (g)"
            placeholderTextColor={isDark ? '#999' : '#666'}
            value={protein}
            onChangeText={setProtein}
          />

          <Button title="Add Entry" onPress={handleSubmit} color={blue} />

          <View style={styles.summary}>
            <Text style={{ color: textColor, marginTop: 20 }}>
              Total Today: {totalCalories} cal / {totalProtein}g protein
            </Text>
          </View>
        </View>
      </TouchableWithoutFeedback>

      <FlatList
        data={entries}
        keyExtractor={(item) => item.id}
        renderItem={EntryItem}
        style={{ flex: 1, marginTop: 20, width: '100%' }}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  inputSection: {
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    borderWidth: 1,
    borderColor: '#444',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  summary: {
    marginTop: 10,
    alignItems: 'center',
  },
  entry: {
    padding: 12,
    marginVertical: 4,
    borderRadius: 8,
  },
});
