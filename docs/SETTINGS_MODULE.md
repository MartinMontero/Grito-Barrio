# Settings Module - Protocolo CDMX

## Overview

The comprehensive Settings module provides users with full control over their Protocolo CDMX experience, including profile management, security configuration, privacy settings, and data management.

## Component Structure

```
Settings.tsx
├── Profile Section
├── Security Section
├── Privacy Section
├── Notifications Section
├── Data Section
├── Accessibility Section
├── About Section
└── Support Section
```

## Features

### 1. User Profile
- **Pseudonym Display**: Shows user's pseudonym with avatar
- **Role & Certification**: Displays current role and certification level
- **Training History**: Lists completed training modules with dates
- **Contact Info**: Editable secure contact information for brigade coordination

### 2. Security Settings
- **Encryption Toggle**: Enable/disable AES-256 encryption
- **Biometric Lock**: Fingerprint/Face ID support
- **Password Management**: Change PIN/password
- **Auto-lock Timeout**: Configurable (1, 5, 15, 30 minutes, or never)
- **Duress Mode**: Alternative password for coercive situations
- **Panic Wipe**: Automatic data deletion after inactivity period
- **Security Audit Log**: Access to security event history

### 3. Privacy Settings
- **Location Fuzzing**: Add ±100m imprecision to coordinates
- **Metadata Stripping**: Auto-remove EXIF data from media
- **Pseudonym Display**: Use pseudonyms instead of real names
- **Hide Previews**: Hide content in app switcher
- **Consent Tracking**: Record occupant and witness consent

### 4. Notifications
- **Alert Notifications**: Emergency incident alerts
- **Sound & Vibration**: Configurable alert feedback
- **Training Reminders**: Pending module notifications
- **Certification Expiration**: Expiry warnings
- **Sync Status**: Synchronization completion alerts

### 5. Data Management
- **Storage Usage**: Visual display of storage consumption
- **Export Data**: JSON export with optional password protection
- **Import Data**: Restore from backup file
- **Cloud Backup**: Optional automatic cloud backup
- **Clear Local Data**: Permanent deletion with confirmation

### 6. Accessibility
- **Font Size**: 4 levels (small, medium, large, extra-large)
- **High Contrast**: Enhanced visibility mode
- **Reduced Motion**: Minimize animations
- **Screen Reader**: Optimize for assistive technologies

### 7. App Information
- **Version Number**: Current app version
- **Build Date**: Compilation date
- **License**: GPL v3
- **Credits**: Open source contributors
- **Legal**: Privacy policy and terms of use

### 8. Support
- **FAQ**: Frequently asked questions
- **Contact**: Support email
- **Bug Reporting**: Submit issues
- **Feature Requests**: Suggest improvements

## Usage

```tsx
import { Settings } from '@/components/features'

// Basic usage
<Settings />

// With navigation callback
<Settings onNavigate={(page) => router.push(page)} />
```

## State Management

The component integrates with Zustand store for:
- User profile data
- App settings
- Authentication state
- Storage information

## Security Features

### Duress Mode
```tsx
// Enabled in settings
const duressMode = settings?.duressModeEnabled

// Opens limited app view with fake/dummy data
// Protects real information in coercive situations
```

### Panic Wipe
```tsx
// Configurable inactivity period
const wipeDays = settings?.panicWipeDays || 30

// Automatic data deletion after specified days of inactivity
```

### Data Export
```tsx
// Export all data to encrypted JSON
const handleExport = () => {
  const data = {
    user: currentUser,
    settings,
    timestamp: new Date().toISOString(),
    version: appVersion
  }
  // Download as JSON file
}
```

## Accessibility Features

### Screen Reader Support
- All interactive elements have proper labels
- ARIA attributes for complex components
- Logical tab order

### Visual Accessibility
- High contrast mode
- Scalable fonts (up to 200%)
- Reduced motion option
- Clear focus indicators

## Internationalization

Currently supports:
- **Español (México)** - Primary language
- **English** - Available for international observers

## Responsive Design

The settings interface adapts to:
- **Mobile**: Tab navigation at top, scrollable content
- **Tablet**: Two-column layout where appropriate
- **Desktop**: Persistent side navigation option

## Best Practices

1. **Confirmation Dialogs**: Destructive actions require confirmation
2. **Progressive Disclosure**: Advanced settings hidden by default
3. **Immediate Feedback**: Settings apply instantly
4. **Offline Support**: All settings work without internet
5. **Privacy First**: No data transmitted without user consent

## Customization

### Adding New Settings

```tsx
// 1. Add to store types
interface Settings {
  // ... existing settings
  newSetting: boolean
}

// 2. Add UI control in appropriate section
<div className="flex items-center justify-between">
  <Label>New Setting</Label>
  <Switch
    checked={settings?.newSetting}
    onCheckedChange={(checked) => updateSettings?.({ newSetting: checked })}
  />
</div>
```

## Testing

### Unit Tests
- Profile information display
- Settings persistence
- Dialog interactions
- Export/import functionality

### E2E Tests
- Complete user flows
- Security feature verification
- Accessibility navigation

## Dependencies

- `date-fns`: Date formatting
- `lucide-react`: Icons
- `@radix-ui/react-*`: UI primitives
- `zustand`: State management

## Future Enhancements

- [ ] Multi-language support expansion
- [ ] Advanced sync options
- [ ] Custom themes
- [ ] Gesture controls
- [ ] Voice commands

## License

GPL v3 - Part of Protocolo CDMX
