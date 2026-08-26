import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Colors } from '../theme';
import { TodayScreen } from '../screens/TodayScreen';
import { ProgramsScreen } from '../screens/ProgramsScreen';
import { CalendarScreen } from '../screens/CalendarScreen';
import { AnalyticsScreen } from '../screens/AnalyticsScreen';
import { CatalogScreen } from '../screens/CatalogScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { Header } from '../components/common/Header';
import { RestTimerModal } from '../components/timer/RestTimerModal';
import { FloatingTimerWidget } from '../components/timer/FloatingTimerWidget';
import {
  Dumbbell,
  ClipboardList,
  Calendar as CalendarIcon,
  TrendingUp,
  BookOpen,
  Settings,
} from 'lucide-react-native';

export type TabType = 'today' | 'programs' | 'calendar' | 'analytics' | 'catalog' | 'settings';

export const AppNavigator: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('today');

  const renderScreen = () => {
    switch (activeTab) {
      case 'today':
        return <TodayScreen />;
      case 'programs':
        return <ProgramsScreen />;
      case 'calendar':
        return <CalendarScreen />;
      case 'analytics':
        return <AnalyticsScreen />;
      case 'catalog':
        return <CatalogScreen />;
      case 'settings':
        return <SettingsScreen />;
      default:
        return <TodayScreen />;
    }
  };

  const getHeaderTitle = () => {
    switch (activeTab) {
      case 'today':
        return "Aujourd'hui";
      case 'programs':
        return 'Mes Programmes';
      case 'calendar':
        return 'Historique & Calendrier';
      case 'analytics':
        return 'Progression & Stats';
      case 'catalog':
        return 'Catalogue & Muscles';
      case 'settings':
        return 'Paramètres & Sauvegardes';
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <Header
        title={getHeaderTitle()}
        onBack={activeTab === 'settings' ? () => setActiveTab('today') : undefined}
        rightAction={
          activeTab !== 'settings' ? (
            <TouchableOpacity
              style={styles.settingsBtn}
              onPress={() => setActiveTab('settings')}
            >
              <Settings color={Colors.textSecondary} size={20} />
            </TouchableOpacity>
          ) : undefined
        }
      />

      {/* Screen Body */}
      <View style={styles.screenContainer}>{renderScreen()}</View>

      {/* Floating Rest Timer Widget (Overlay) */}
      <FloatingTimerWidget />

      {/* Rest Timer Modal */}
      <RestTimerModal />

      {/* Bottom Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('today')}
          activeOpacity={0.7}
        >
          <Dumbbell
            color={activeTab === 'today' ? Colors.neonGreen : Colors.textMuted}
            size={22}
          />
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'today' && styles.tabLabelActive,
            ]}
          >
            Aujourd'hui
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('programs')}
          activeOpacity={0.7}
        >
          <ClipboardList
            color={activeTab === 'programs' ? Colors.neonGreen : Colors.textMuted}
            size={22}
          />
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'programs' && styles.tabLabelActive,
            ]}
          >
            Programmes
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('calendar')}
          activeOpacity={0.7}
        >
          <CalendarIcon
            color={activeTab === 'calendar' ? Colors.neonGreen : Colors.textMuted}
            size={22}
          />
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'calendar' && styles.tabLabelActive,
            ]}
          >
            Historique
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('analytics')}
          activeOpacity={0.7}
        >
          <TrendingUp
            color={activeTab === 'analytics' ? Colors.neonGreen : Colors.textMuted}
            size={22}
          />
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'analytics' && styles.tabLabelActive,
            ]}
          >
            Progression
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('catalog')}
          activeOpacity={0.7}
        >
          <BookOpen
            color={activeTab === 'catalog' ? Colors.neonGreen : Colors.textMuted}
            size={22}
          />
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'catalog' && styles.tabLabelActive,
            ]}
          >
            Catalogue
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  screenContainer: {
    flex: 1,
  },
  settingsBtn: {
    padding: 6,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
    paddingVertical: 10,
    paddingBottom: 22,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: Colors.textMuted,
  },
  tabLabelActive: {
    color: Colors.neonGreen,
  },
});
