import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { eachDayOfInterval, endOfWeek, format, isBefore, isSameDay, startOfDay, startOfWeek } from 'date-fns';
import { it } from 'date-fns/locale';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface CalendarPickerProps {
    selectedDate: Date;
    onDateSelect: (date: Date) => void;
    eventDates: Date[];
}

// Color definitions matching the app theme structure
const Colors = {
    light: {
        background: '#f8fafc',
        card: '#FFFFFF',
        text: '#0f172a',
        textSecondary: '#64748b',
        primary: '#22c55e',
        border: '#e2e8f0',
        calendarItem: '#FFFFFF',
        calendarItemActive: '#22c55e',
        warning: '#f97316', // Orange for past events
    },
    dark: {
        background: '#020403',
        card: '#121212',
        text: '#F8faf9',
        textSecondary: '#94a3b8',
        primary: '#4ADE80',
        border: '#333333',
        calendarItem: '#1E1E1E',
        calendarItemActive: '#22c55e', // Keep primary green for active state
        warning: '#f97316', // Orange for past events
    }
};

export function CalendarPicker({ selectedDate, onDateSelect, eventDates }: CalendarPickerProps) {
    const { activeTheme } = useTheme();
    const theme = Colors[activeTheme];
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [days, setDays] = useState<Date[]>([]);

    useEffect(() => {
        // Generate days for the current month view
        const start = startOfWeek(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1), { weekStartsOn: 1 });
        const endDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
        // Use endOfWeek to show only necessary rows instead of fixed 6 rows
        const end = endOfWeek(endDayOfMonth, { weekStartsOn: 1 });

        const daysInterval = eachDayOfInterval({ start, end });
        setDays(daysInterval);
    }, [currentMonth]);

    const changeMonth = (increment: number) => {
        const newMonth = new Date(currentMonth);
        newMonth.setMonth(newMonth.getMonth() + increment);
        setCurrentMonth(newMonth);
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.navButton}>
                <Ionicons name="chevron-back" size={24} color={theme.text} />
            </TouchableOpacity>
            <Text style={[styles.monthTitle, { color: theme.text }]}>
                {format(currentMonth, 'MMMM yyyy', { locale: it }).toUpperCase()}
            </Text>
            <TouchableOpacity onPress={() => changeMonth(1)} style={styles.navButton}>
                <Ionicons name="chevron-forward" size={24} color={theme.text} />
            </TouchableOpacity>
        </View>
    );

    const renderDaysHeader = () => {
        const weekDays = ['LUN', 'MAR', 'MER', 'GIO', 'VEN', 'SAB', 'DOM'];
        return (
            <View style={styles.weekDaysRow}>
                {weekDays.map((day, index) => (
                    <Text key={index} style={[styles.weekDayText, { color: theme.textSecondary }]}>{day}</Text>
                ))}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {renderHeader()}
            {renderDaysHeader()}
            <View style={styles.calendarGrid}>
                {days.map((day, index) => {
                    const isSelected = selectedDate && isSameDay(day, selectedDate);
                    const isToday = isSameDay(day, new Date());
                    const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
                    const hasEvent = eventDates.some(d => isSameDay(d, day));
                    const isPast = isBefore(day, startOfDay(new Date()));

                    // Determine background color (only for events, not selection)
                    let backgroundColor;
                    if (hasEvent && !isSelected) {
                        backgroundColor = isPast ? theme.warning : theme.primary; // Orange if past, Green if future
                    }

                    return (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.dayCell,
                                // Apply background only for events (not selected)
                                backgroundColor && { backgroundColor, borderRadius: 50 },

                                // Selected: circle outline only (no fill)
                                isSelected && {
                                    borderWidth: 2,
                                    borderColor: theme.primary,
                                    borderRadius: 50
                                },

                                // Opacity for non-selected events
                                !isSelected && hasEvent && { opacity: 0.8 },

                                // Today marker (if not selected/event)
                                !isSelected && !hasEvent && isToday && {
                                    borderWidth: 1,
                                    borderColor: theme.primary,
                                    borderRadius: 50
                                }
                            ]}
                            onPress={() => onDateSelect(day)}
                        >
                            <Text style={[
                                styles.dayText,
                                {
                                    // White text only if event has background (not for selected)
                                    color: (hasEvent && !isSelected) ? '#FFFFFF' : (isCurrentMonth ? theme.text : theme.textSecondary),
                                    fontWeight: (hasEvent || isSelected || isToday) ? '700' : '400',
                                    opacity: isCurrentMonth ? 1 : 0.5
                                }
                            ]}>
                                {format(day, 'd')}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 0,
        marginTop: 0, // Removed top margin
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginBottom: 10, // Reduced from 24
        paddingTop: 10,
    },
    monthTitle: {
        fontSize: 18,
        fontWeight: '700',
        textTransform: 'capitalize',
    },
    navButton: {
        padding: 8,
    },
    weekDaysRow: {
        flexDirection: 'row',
        marginBottom: 8,
        paddingHorizontal: 10, // Restored padding
    },
    weekDayText: {
        flex: 1,
        textAlign: 'center',
        fontSize: 12,
        fontWeight: '600',
    },
    calendarGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 10, // Restored padding
    },
    dayCell: {
        width: '14.28%', // 100% / 7
        aspectRatio: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16, // Increased from 2 to add vertical space
    },
    dayText: {
        fontSize: 14,
    },
});
