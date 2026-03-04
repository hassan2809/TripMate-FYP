import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';

const CustomDatePicker = ({ 
  label, 
  value, 
  onDateChange, 
  placeholder = "Select a date", 
  minimumDate, 
  maximumDate,
  error
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [tempDate, setTempDate] = useState(value || new Date());

  const handleConfirm = () => {
    onDateChange(tempDate);
    setShowPicker(false);
  };

  const handleCancel = () => {
    setShowPicker(false);
  };

  const handleChange = (event, selectedDate) => {
    const currentDate = selectedDate || tempDate;
    if (Platform.OS === 'android') {
      // Android closes automatically after selection
      setShowPicker(false);
      onDateChange(currentDate);
    } else {
      // iOS requires manual confirmation
      setTempDate(currentDate);
    }
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <TouchableOpacity
        style={[styles.button, error && styles.errorBorder]}
        onPress={() => setShowPicker(true)}
      >
        <FontAwesome5
          name="calendar-alt"
          size={18}
          color="#64748b"
          style={styles.icon}
        />
        <Text style={[
          styles.buttonText,
          value ? styles.valueText : styles.placeholderText
        ]}>
          {value ? format(value, 'MMM d, yyyy') : placeholder}
        </Text>
      </TouchableOpacity>
      
      {error && (
        <Text style={styles.errorText}>
          <FontAwesome5 name="exclamation-circle" size={14} color="#ef4444" /> {error}
        </Text>
      )}
      
      {showPicker && Platform.OS === 'android' && (
        <DateTimePicker
          value={tempDate}
          mode="date"
          display="default"
          onChange={handleChange}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
        />
      )}
      
      {showPicker && Platform.OS === 'ios' && (
        <Modal
          transparent={true}
          animationType="slide"
          visible={showPicker}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.pickerHeader}>
                <TouchableOpacity onPress={handleCancel}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{label || "Select Date"}</Text>
                <TouchableOpacity onPress={handleConfirm}>
                  <Text style={styles.doneText}>Done</Text>
                </TouchableOpacity>
              </View>
              
              <DateTimePicker
                value={tempDate}
                mode="date"
                display="spinner"
                onChange={handleChange}
                minimumDate={minimumDate}
                maximumDate={maximumDate}
                style={styles.picker}
              />
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#475569',
    marginBottom: 8,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: 'white',
  },
  errorBorder: {
    borderColor: '#ef4444',
  },
  icon: {
    marginRight: 8,
  },
  buttonText: {
    flex: 1,
  },
  placeholderText: {
    color: '#94a3b8',
  },
  valueText: {
    color: '#334155',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 13,
    marginTop: 4,
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e3a8a',
  },
  cancelText: {
    fontSize: 16,
    color: '#64748b',
  },
  doneText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563eb',
  },
  picker: {
    height: 220,
  },
});

export default CustomDatePicker;
