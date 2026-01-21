import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ActivityIndicator, Keyboard, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';

interface EditProfileModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (data: { firstName: string; lastName: string; phone: string; roleSpecific: string; preferredFoot: string }) => Promise<void>;
    initialData: {
        firstName: string;
        lastName: string;
        phone: string;
        roleSpecific: string;
        preferredFoot: string;
    };
    theme: any; // Using any for simplicity matching the parent theme structure
}

export default function EditProfileModal({ visible, onClose, onSave, initialData, theme }: EditProfileModalProps) {
    const [firstName, setFirstName] = useState(initialData.firstName);
    const [lastName, setLastName] = useState(initialData.lastName);
    const [phone, setPhone] = useState(initialData.phone);
    const [roleSpecific, setRoleSpecific] = useState(initialData.roleSpecific);
    const [preferredFoot, setPreferredFoot] = useState(initialData.preferredFoot || 'dx');
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        setLoading(true);
        try {
            await onSave({ firstName, lastName, phone, roleSpecific, preferredFoot });
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={[styles.overlay, { backgroundColor: theme.modalOverlay }]}>
                        <View style={[styles.container, { backgroundColor: theme.card }]}>
                            <View style={styles.header}>
                                <Text style={[styles.title, { color: theme.text }]}>Modifica Profilo</Text>
                                <TouchableOpacity onPress={onClose}>
                                    <MaterialIcons name="close" size={24} color={theme.textSecondary} />
                                </TouchableOpacity>
                            </View>

                            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
                                <View style={styles.form}>
                                    <View style={styles.inputGroup}>
                                        <Text style={[styles.label, { color: theme.textSecondary }]}>Nome</Text>
                                        <TextInput
                                            style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
                                            value={firstName}
                                            onChangeText={setFirstName}
                                        />
                                    </View>
                                    <View style={styles.inputGroup}>
                                        <Text style={[styles.label, { color: theme.textSecondary }]}>Cognome</Text>
                                        <TextInput
                                            style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
                                            value={lastName}
                                            onChangeText={setLastName}
                                        />
                                    </View>
                                    <View style={styles.inputGroup}>
                                        <Text style={[styles.label, { color: theme.textSecondary }]}>Piede Preferito</Text>
                                        <View style={styles.footSelector}>
                                            {['dx', 'sx', 'ambidestro'].map((foot) => {
                                                const isSelected = preferredFoot === foot;
                                                const label = foot === 'dx' ? 'Destro' : foot === 'sx' ? 'Sinistro' : 'Ambidestro';
                                                return (
                                                    <TouchableOpacity
                                                        key={foot}
                                                        style={[
                                                            styles.footOption,
                                                            {
                                                                borderColor: isSelected ? theme.primary : theme.border,
                                                                backgroundColor: isSelected ? theme.primary : theme.background
                                                            }
                                                        ]}
                                                        onPress={() => setPreferredFoot(foot)}
                                                    >
                                                        <Text style={[
                                                            styles.footOptionText,
                                                            { color: isSelected ? '#FFF' : theme.text }
                                                        ]}>
                                                            {label}
                                                        </Text>
                                                    </TouchableOpacity>
                                                );
                                            })}
                                        </View>
                                    </View>
                                    <View style={styles.inputGroup}>
                                        <Text style={[styles.label, { color: theme.textSecondary }]}>Telefono</Text>
                                        <TextInput
                                            style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
                                            value={phone}
                                            onChangeText={setPhone}
                                            keyboardType="phone-pad"
                                        />
                                    </View>
                                    <View style={styles.inputGroup}>
                                        <Text style={[styles.label, { color: theme.textSecondary }]}>Ruolo Specifico (es. Capitano)</Text>
                                        <TextInput
                                            style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
                                            value={roleSpecific}
                                            onChangeText={setRoleSpecific}
                                        />
                                    </View>
                                </View>

                                <TouchableOpacity
                                    style={[styles.saveButton, { backgroundColor: theme.primary }]}
                                    onPress={handleSave}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <ActivityIndicator color="#FFF" />
                                    ) : (
                                        <Text style={styles.saveButtonText}>Salva Modifiche</Text>
                                    )}
                                </TouchableOpacity>
                            </ScrollView>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0)' },
    container: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '90%' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    title: { fontSize: 20, fontWeight: '700' },
    form: { gap: 16, marginBottom: 32 },
    inputGroup: { gap: 8 },
    label: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase' },
    input: { borderWidth: 1, borderRadius: 12, padding: 16, fontSize: 16 },
    footSelector: { flexDirection: 'row', gap: 10 },
    footOption: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 12, borderWidth: 1 },
    footOptionText: { fontSize: 14, fontWeight: '600' },
    saveButton: { padding: 18, borderRadius: 16, alignItems: 'center', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
    saveButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});
