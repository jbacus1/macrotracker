import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  FlatList,
  Keyboard,
  TouchableWithoutFeedback,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Entry {
  id: string;
  calories: number;
  protein: number;
  timestamp: string;
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

  const getTodayKey = () => {
    const today = new Date();
    return `entries-${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
  };

  useEffect(() => {
    loadEntries();
  }, []);

  const handleSubmit = () => {
    const cal = parseFloat(calories);
    const pro = parseFloat(protein);
    if ((!calories && !protein) || isNaN(cal) || isNaN(pro)) return;

    const newEntry: Entry = {
      id: Date.now().toString(),
      calories: calories ? cal : 0,
      protein: protein ? pro : 0,
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
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[styles.container, { backgroundColor }]}
      >
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

        <FlatList
          data={entries}
          keyExtractor={(item) => item.id}
          renderItem={EntryItem}
          style={{ marginTop: 20, width: '100%' }}
        />
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
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
