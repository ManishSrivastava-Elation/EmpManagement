import { Ionicons } from "@expo/vector-icons";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  FlatList,
  Modal,
  TouchableWithoutFeedback,
  Keyboard,
  Animated,
  Dimensions,
  SafeAreaView,
  Platform,
} from "react-native";

import { theme } from "../../theme";

const { colors, spacing, radius, fontSize, fontWeight } = theme;
const { height, width } = Dimensions.get("window");

type Option = {
  label: string;
  value: string | number;
  icon?: keyof typeof Ionicons.glyphMap;
};

type Props = {
  label: string;
  required?: boolean;
  error?: string;
  options: Option[];
  value?: string | number | null;
  onChange: (value: string | number | null) => void;
  placeholder?: string;
  disabled?: boolean;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  searchPlaceholder?: string;
  emptyStateText?: string;
  loading?: boolean;
  onSearch?: (query: string) => void;
};

export default function SearchableSelect({
  label,
  required,
  error,
  options,
  value,
  onChange,
  placeholder = "Select an option",
  disabled,
  leftIcon,
  searchPlaceholder = "Search...",
  emptyStateText = "No results found",
  loading = false,
  onSearch,
}: Props) {
  const [focused, setFocused] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isClosing, setIsClosing] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  
  // Animation values
  const slideAnim = useRef(new Animated.Value(height)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const searchInputRef = useRef<TextInput>(null);

  const selectedOption = useMemo(
    () => options.find((opt) => opt.value === value),
    [options, value]
  );

  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;
    return options.filter((opt) =>
      opt.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [options, searchQuery]);

  useEffect(() => {
    if (modalVisible) {
      // Slide up animation
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 350,
          useNativeDriver: true,
          easing: (t) => t * t * (3 - 2 * t), // ease in-out
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (!isClosing) {
      closeModal();
    }
  }, [modalVisible]);

  const closeModal = useCallback(() => {
    setIsClosing(true);
    Keyboard.dismiss();
    
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsClosing(false);
      setModalVisible(false);
      setSearchQuery("");
      setIsSearchFocused(false);
    });
  }, []);

  const handleSelect = useCallback((option: Option) => {
    onChange(option.value);
    closeModal();
  }, [onChange, closeModal]);

  const handleClear = useCallback(() => {
    onChange(null);
    setSearchQuery("");
  }, [onChange]);

  const handleSearchChange = useCallback((text: string) => {
    setSearchQuery(text);
    onSearch?.(text);
  }, [onSearch]);

  const handleBackdropPress = useCallback(() => {
    closeModal();
  }, [closeModal]);

  const handleSearchFocus = useCallback(() => {
    setIsSearchFocused(true);
    // Focus the input when user taps on search
    setTimeout(() => searchInputRef.current?.focus(), 100);
  }, []);

  const handleSearchBlur = useCallback(() => {
    setIsSearchFocused(false);
  }, []);

  const renderItem = useCallback(({ item, index }: { item: Option; index: number }) => {
    const isSelected = item.value === value;
    return (
      <TouchableOpacity
        style={[
          styles.optionItem,
          isSelected && styles.optionSelected,
          index === 0 && styles.optionFirst,
        ]}
        onPress={() => handleSelect(item)}
        activeOpacity={0.6}
      >
        <View style={styles.optionContent}>
          <View style={styles.optionLeft}>
            {item.icon && (
              <Ionicons
                name={item.icon}
                size={20}
                color={isSelected ? colors.primary : colors.textSecondary}
                style={styles.optionIcon}
              />
            )}
            <Text
              style={[
                styles.optionText,
                isSelected && styles.optionTextSelected,
              ]}
              numberOfLines={2}
            >
              {item.label}
            </Text>
          </View>
          {isSelected && (
            <View style={styles.checkmarkContainer}>
              <Ionicons
                name="checkmark-circle"
                size={24}
                color={colors.primary}
              />
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  }, [value, handleSelect]);

  const keyExtractor = useCallback((item: Option) => String(item.value), []);

  return (
    <>
      <View style={styles.field}>
        <View style={styles.labelContainer}>
          <Text style={styles.label}>
            {label}
            {required && <Text style={styles.required}> *</Text>}
          </Text>
          {value !== null && value !== undefined && (
            <TouchableOpacity onPress={handleClear} style={styles.clearSelectionBtn}>
              <Text style={styles.clearSelectionLabel}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => !disabled && setModalVisible(true)}
          disabled={disabled}
        >
          <View
            style={[
              styles.inputWrap,
              focused && styles.inputFocused,
              !!error && styles.inputError,
              disabled && styles.disabled,
            ]}
          >
            {leftIcon && (
              <Ionicons
                name={leftIcon}
                size={18}
                color={selectedOption ? colors.primary : colors.textSecondary}
                style={styles.icon}
              />
            )}

            <Text
              style={[
                styles.inputText,
                !selectedOption && styles.placeholderText,
                selectedOption && styles.inputTextSelected,
              ]}
              numberOfLines={1}
            >
              {selectedOption ? selectedOption.label : placeholder}
            </Text>

            <Ionicons
              name="chevron-down"
              size={18}
              color={colors.textSecondary}
              style={styles.chevron}
            />
          </View>
        </TouchableOpacity>

        {!!error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={14} color={colors.danger} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </View>

      {/* Full Screen Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="none"
        onRequestClose={closeModal}
        statusBarTranslucent
      >
        <TouchableWithoutFeedback onPress={handleBackdropPress}>
          <Animated.View 
            style={[
              styles.modalOverlay,
              { opacity: fadeAnim }
            ]}
          >
            <SafeAreaView style={styles.safeArea}>
              <TouchableWithoutFeedback>
                <Animated.View 
                  style={[
                    styles.modalContent,
                    { 
                      transform: [{ translateY: slideAnim }],
                    }
                  ]}
                >
                  {/* Header */}
                  <View style={styles.modalHeader}>
                    <View style={styles.headerLeft}>
                      <TouchableOpacity 
                        onPress={closeModal}
                        style={styles.headerBackBtn}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                      </TouchableOpacity>
                      <Text style={styles.modalTitle}>{label}</Text>
                    </View>
                    <TouchableOpacity 
                      onPress={handleClear}
                      style={styles.headerClearBtn}
                      disabled={value === null || value === undefined}
                    >
                      <Text style={[
                        styles.headerClearText,
                        (value === null || value === undefined) && styles.headerClearDisabled
                      ]}>
                        Clear
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Search Input - Keyboard only opens on tap */}
                  <TouchableOpacity 
                    activeOpacity={1}
                    onPress={handleSearchFocus}
                    style={styles.searchTouchable}
                  >
                    <View style={[
                      styles.searchWrap,
                      isSearchFocused && styles.searchFocused
                    ]}>
                      <Ionicons
                        name="search"
                        size={20}
                        color={isSearchFocused ? colors.primary : colors.textSecondary}
                        style={styles.searchIcon}
                      />
                      <TextInput
                        ref={searchInputRef}
                        style={styles.searchInput}
                        placeholder={searchPlaceholder}
                        placeholderTextColor={colors.textSecondary}
                        value={searchQuery}
                        onChangeText={handleSearchChange}
                        returnKeyType="search"
                        clearButtonMode="never"
                        autoCapitalize="none"
                        autoCorrect={false}
                        onFocus={handleSearchFocus}
                        onBlur={handleSearchBlur}
                        editable={isSearchFocused}
                        // Remove autoFocus
                      />
                      {searchQuery.length > 0 && (
                        <TouchableOpacity
                          onPress={() => setSearchQuery("")}
                          style={styles.searchClearBtn}
                        >
                          <Ionicons
                            name="close-circle"
                            size={20}
                            color={colors.textSecondary}
                          />
                        </TouchableOpacity>
                      )}
                    </View>
                  </TouchableOpacity>

                  {/* Results Info */}
                  <View style={styles.resultsInfo}>
                    <Text style={styles.resultsCount}>
                      {filteredOptions.length} {filteredOptions.length === 1 ? 'result' : 'results'}
                    </Text>
                    {selectedOption && (
                      <View style={styles.selectedBadge}>
                        <Ionicons name="checkmark-circle" size={14} color={colors.primary} />
                        <Text style={styles.selectedBadgeText}>
                          {selectedOption.label}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Options List */}
                  {loading ? (
                    <View style={styles.loadingContainer}>
                      <View style={styles.loadingSpinner}>
                        <Ionicons name="refresh" size={32} color={colors.primary} />
                      </View>
                      <Text style={styles.loadingText}>Loading options...</Text>
                    </View>
                  ) : (
                    <FlatList
                      data={filteredOptions}
                      keyExtractor={keyExtractor}
                      style={styles.optionsList}
                      contentContainerStyle={styles.optionsListContent}
                      showsVerticalScrollIndicator={false}
                      keyboardShouldPersistTaps="handled"
                      initialNumToRender={20}
                      maxToRenderPerBatch={10}
                      windowSize={10}
                      renderItem={renderItem}
                      ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                          <View style={styles.emptyIconContainer}>
                            <Ionicons
                              name="search-outline"
                              size={64}
                              color={colors.border}
                            />
                          </View>
                          <Text style={styles.emptyTitle}>{emptyStateText}</Text>
                          <Text style={styles.emptySubtext}>
                            Try adjusting your search or filter
                          </Text>
                        </View>
                      }
                    />
                  )}
                </Animated.View>
              </TouchableWithoutFeedback>
            </SafeAreaView>
          </Animated.View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  field: {
    marginBottom: spacing.md,
  },

  labelContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },

  label: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },

  required: {
    color: colors.danger,
  },

  clearSelectionBtn: {
    paddingHorizontal: spacing.xs,
  },

  clearSelectionLabel: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },

  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    minHeight: 48,
  },

  inputFocused: {
    borderColor: colors.primary,
    backgroundColor: colors.white,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  inputError: {
    borderColor: colors.danger,
  },

  disabled: {
    opacity: 0.5,
  },

  icon: {
    marginRight: spacing.sm,
  },

  inputText: {
    flex: 1,
    color: colors.text,
    fontSize: fontSize.sm,
    paddingVertical: spacing.md,
  },

  inputTextSelected: {
    color: colors.text,
    fontWeight: fontWeight.medium,
  },

  placeholderText: {
    color: colors.textSecondary,
  },

  chevron: {
    marginLeft: spacing.sm,
  },

  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.xs,
    gap: spacing.xs,
  },

  errorText: {
    color: colors.danger,
    fontSize: fontSize.xs,
  },

  // Full Screen Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },

  safeArea: {
    flex: 1,
    justifyContent: "flex-end",
  },

  modalContent: {
    flex: 1,
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.md,
    borderTopRightRadius: radius.md,
    maxHeight: "92%",
    minHeight: "60%",
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },

  headerBackBtn: {
    padding: spacing.xs,
    marginLeft: -spacing.xs,
  },

  modalTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },

  headerClearBtn: {
    padding: spacing.xs,
  },

  headerClearText: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },

  headerClearDisabled: {
    opacity: 0.3,
  },

  searchTouchable: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },

  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.background,
  },

  searchFocused: {
    borderColor: colors.primary,
    backgroundColor: colors.white,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  searchIcon: {
    marginRight: spacing.sm,
  },

  searchInput: {
    flex: 1,
    paddingVertical: spacing.sm,
    color: colors.text,
    fontSize: fontSize.sm,
    minHeight: 44,
  },

  searchClearBtn: {
    paddingLeft: spacing.xs,
  },

  resultsInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
  },

  resultsCount: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
  },

  selectedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.primary + "15",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },

  selectedBadgeText: {
    color: colors.primary,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },

  optionsList: {
    flex: 1,
  },

  optionsListContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },

  optionItem: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radius.sm,
    marginVertical: 1,
  },

  optionFirst: {
    marginTop: spacing.xs,
  },

  optionContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  optionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  optionIcon: {
    marginRight: spacing.md,
  },

  optionSelected: {
    backgroundColor: colors.primary + "12",
  },

  optionText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.text,
  },

  optionTextSelected: {
    color: colors.primary,
    fontWeight: fontWeight.medium,
  },

  checkmarkContainer: {
    marginLeft: spacing.sm,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: spacing.xl * 2,
  },

  loadingSpinner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary + "10",
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    marginTop: spacing.md,
    color: colors.textSecondary,
    fontSize: fontSize.sm,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: spacing.xl * 2,
  },

  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyTitle: {
    marginTop: spacing.md,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },

  emptySubtext: {
    marginTop: spacing.xs,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
});