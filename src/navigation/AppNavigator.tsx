import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Platform } from 'react-native';
import { Colors, Spacing, BorderRadius } from '../theme';
import { TodayScreen } from '../screens/TodayScreen';
import { ProgramsScreen } from '../screens/ProgramsScreen';
import { CalendarScreen } from '../screens/CalendarScreen';
import { AnalyticsScreen } from '../screens/AnalyticsScreen';
import { CatalogScreen } from '../screens/CatalogScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { Header } from '../components/common/Header';
import { RestTimerModal } from '../components/timer/RestTimerModal';
import { FloatingTimerWidget } from '../components/timer/FloatingTimerWidget';
import { BlurView } from 'expo-blur';
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
              style={styles.settingsGlassBtn}
              onPress={() => setActiveTab('settings')}
              activeOpacity={0.7}
            >
              <Settings color={Colors.neonGreen} size={18} />
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

      {/* Liquid Glass Floating Bottom Tab Bar */}
      <View style={styles.floatingTabBarWrapper}>
        <BlurView intensity={Platform.OS === 'ios' ? 80 : 100} tint="dark" style={styles.glassTabBar}>
          {/* Glass Top Highlight Specular Edge */}
          <View style={styles.glassTopEdge} />

          {/* Today */}
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'today' && styles.tabItemActive]}
            onPress={() => setActiveTab('today')}
            activeOpacity={0.7}
          >
            <View style={[styles.iconWrap, activeTab === 'today' && styles.iconWrapActive]}>
              <Dumbbell
                color={activeTab === 'today' ? Colors.neonGreen : Colors.textSecondary}
                size={21}
              />
            </View>
            <Text style={[styles.tabLabel, activeTab === 'today' && styles.tabLabelActive]}>
              Aujourd'hui
            </Text>
          </TouchableOpacity>

          {/* Programs */}
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'programs' && styles.tabItemActive]}
            onPress={() => setActiveTab('programs')}
            activeOpacity={0.7}
          >
            <View style={[styles.iconWrap, activeTab === 'programs' && styles.iconWrapActive]}>
              <ClipboardList
                color={activeTab === 'programs' ? Colors.neonGreen : Colors.textSecondary}
                size={21}
              />
            </View>
            <Text style={[styles.tabLabel, activeTab === 'programs' && styles.tabLabelActive]}>
              Programmes
            </Text>
          </TouchableOpacity>

          {/* Calendar */}
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'calendar' && styles.tabItemActive]}
            onPress={() => setActiveTab('calendar')}
            activeOpacity={0.7}
          >
            <View style={[styles.iconWrap, activeTab === 'calendar' && styles.iconWrapActive]}>
              <CalendarIcon
                color={activeTab === 'calendar' ? Colors.neonGreen : Colors.textSecondary}
                size={21}
              />
            </View>
            <Text style={[styles.tabLabel, activeTab === 'calendar' && styles.tabLabelActive]}>
              Historique
            </Text>
          </TouchableOpacity>

          {/* Analytics */}
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'analytics' && styles.tabItemActive]}
            onPress={() => setActiveTab('analytics')}
            activeOpacity={0.7}
          >
            <View style={[styles.iconWrap, activeTab === 'analytics' && styles.iconWrapActive]}>
              <TrendingUp
                color={activeTab === 'analytics' ? Colors.neonGreen : Colors.textSecondary}
                size={21}
              />
            </View>
            <Text style={[styles.tabLabel, activeTab === 'analytics' && styles.tabLabelActive]}>
              Progression
            </Text>
          </TouchableOpacity>

          {/* Catalog */}
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'catalog' && styles.tabItemActive]}
            onPress={() => setActiveTab('catalog')}
            activeOpacity={0.7}
          >
            <View style={[styles.iconWrap, activeTab === 'catalog' && styles.iconWrapActive]}>
              <BookOpen
                color={activeTab === 'catalog' ? Colors.neonGreen : Colors.textSecondary}
                size={21}
              />
            </View>
            <Text style={[styles.tabLabel, activeTab === 'catalog' && styles.tabLabelActive]}>
              Catalogue
            </Text>
          </TouchableOpacity>
        </BlurView>
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
  settingsGlassBtn: {
    padding: 8,
    backgroundColor: Colors.glassNeon,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.glassNeonBorder,
  },
  floatingTabBarWrapper: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 24 : 14,
    left: 14,
    right: 14,
    shadowColor: Colors.neonGreen,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
  },
  glassTabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.glassTabBar,
    borderRadius: BorderRadius.xl,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderWidth: 1.5,
    borderColor: Colors.glassBorder,
    overflow: 'hidden',
  },
  glassTopEdge: {
    position: 'absolute',
    top: 0,
    left: 16,
    right: 16,
    height: 1.5,
    backgroundColor: Colors.glassBorderTop,
    borderRadius: 1,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    borderRadius: BorderRadius.lg,
    gap: 3,
  },
  tabItemActive: {
    backgroundColor: 'rgba(51, 255, 85, 0.08)',
  },
  iconWrap: {
    padding: 4,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {
    backgroundColor: Colors.neonGreenSoft,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 0.2,
  },
  tabLabelActive: {
    color: Colors.neonGreen,
    fontWeight: '900',
  },
});
