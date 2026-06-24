import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '@/hooks/useApp';
import { useAuth } from '@/hooks/useAuth';
import { Colors, Shadows } from '@/constants/theme';
import { GoogleIcon, EmailIcon } from '@/components/icons/Icons';

export default function AuthScreen() {
  const insets = useSafeAreaInsets();
  const { state, dispatch } = useApp();
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    authMode,
    authEmail,
    authPassword,
    authUsername,
    authDob,
    authWeight,
    authHeight,
    authPhone,
  } = state;

  const isChoose = authMode === 'choose';
  const isEmail = authMode === 'email';
  const isSignup = authMode === 'signup';

  const emailCanSubmit =
    authEmail.trim().length > 3 && authPassword.length >= 6;
  const signupCanSubmit =
    emailCanSubmit && authUsername.trim().length > 1;

  const title = isSignup ? 'Create your account' : 'Welcome back';
  const subtitle = isSignup
    ? 'Start tracking in under a minute.'
    : 'Sign in to pick up where you left off.';

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setAuthError(null);
    setIsSubmitting(true);
    try {
      const result = isSignup
        ? await signUpWithEmail(authEmail.trim(), authPassword)
        : await signInWithEmail(authEmail.trim(), authPassword);
      if (result.error) {
        setAuthError(result.error);
      } else {
        dispatch({ type: 'RESET_AUTH' });
      }
    } catch (e: any) {
      setAuthError(e.message ?? 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    if (isSubmitting) return;
    setAuthError(null);
    setIsSubmitting(true);
    try {
      await signInWithGoogle();
      dispatch({ type: 'RESET_AUTH' });
    } catch (e: any) {
      setAuthError(e.message ?? 'Google sign-in failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const setField = (field: string, value: string) => {
    dispatch({ type: 'SET_AUTH_FIELD', payload: { field, value } });
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={[styles.container, { paddingTop: insets.top }]}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 30 }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Brand header */}
        <View style={styles.brandBlock}>
          <View style={[styles.logoTile, Shadows.button]}>
            <View style={styles.logoBars}>
              <View style={[styles.bar, { height: 11 }]} />
              <View style={[styles.bar, { height: 22 }]} />
              <View style={[styles.bar, { height: 16 }]} />
            </View>
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>

        {/* Error banner */}
        {authError && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{authError}</Text>
          </View>
        )}

        {/* Loading indicator */}
        {isSubmitting && (
          <ActivityIndicator size="small" color={Colors.accent} style={{ marginBottom: 8 }} />
        )}

        {/* CHOOSE mode */}
        {isChoose && (
          <View style={styles.formGroup}>
            {/* Google */}
            <TouchableOpacity
              style={[styles.googleButton, Shadows.cardSmall]}
              activeOpacity={0.7}
              onPress={handleGoogle}
            >
              <GoogleIcon />
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Email */}
            <TouchableOpacity
              style={[styles.emailButton, Shadows.button]}
              activeOpacity={0.7}
              onPress={() => dispatch({ type: 'SET_AUTH_MODE', payload: 'email' })}
            >
              <EmailIcon />
              <Text style={styles.emailButtonText}>Continue with email</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => dispatch({ type: 'SET_AUTH_MODE', payload: 'signup' })}
            >
              <Text style={styles.switchLink}>New here? Create an account</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* EMAIL (sign in) mode */}
        {isEmail && (
          <View style={styles.formGroup}>
            <View style={styles.inputCard}>
              <Text style={styles.inputLabel}>EMAIL</Text>
              <TextInput
                style={styles.inputField}
                value={authEmail}
                onChangeText={(t) => setField('authEmail', t)}
                placeholder="you@email.com"
                placeholderTextColor={Colors.placeholder}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputCard}>
              <Text style={styles.inputLabel}>PASSWORD</Text>
              <TextInput
                style={styles.inputField}
                value={authPassword}
                onChangeText={(t) => setField('authPassword', t)}
                placeholder="At least 6 characters"
                placeholderTextColor={Colors.placeholder}
                secureTextEntry
              />
            </View>

            <TouchableOpacity style={styles.forgotRow}>
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.primaryButton,
                emailCanSubmit
                  ? [styles.primaryActive, Shadows.button]
                  : styles.primaryDisabled,
              ]}
              activeOpacity={emailCanSubmit && !isSubmitting ? 0.7 : 1}
              onPress={emailCanSubmit && !isSubmitting ? handleSubmit : undefined}
            >
              <Text
                style={[
                  styles.primaryButtonText,
                  !emailCanSubmit && styles.primaryButtonTextDisabled,
                ]}
              >
                {isSubmitting ? 'Signing in...' : 'Sign in'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() =>
                dispatch({ type: 'SET_AUTH_MODE', payload: 'signup' })
              }
            >
              <Text style={styles.toggleLink}>
                New here? Create an account
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() =>
                dispatch({ type: 'SET_AUTH_MODE', payload: 'choose' })
              }
            >
              <Text style={styles.backLink}>All sign-in options</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* SIGNUP mode */}
        {isSignup && (
          <View style={styles.formGroup}>
            <View style={styles.inputCard}>
              <Text style={styles.inputLabel}>USERNAME</Text>
              <View style={styles.usernameRow}>
                <Text style={styles.atSymbol}>@</Text>
                <TextInput
                  style={[styles.inputField, styles.flex]}
                  value={authUsername}
                  onChangeText={(t) => setField('authUsername', t)}
                  placeholder="username"
                  placeholderTextColor={Colors.placeholder}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            <View style={styles.inputCard}>
              <Text style={styles.inputLabel}>EMAIL</Text>
              <TextInput
                style={styles.inputField}
                value={authEmail}
                onChangeText={(t) => setField('authEmail', t)}
                placeholder="you@email.com"
                placeholderTextColor={Colors.placeholder}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputCard}>
              <Text style={styles.inputLabel}>PASSWORD</Text>
              <TextInput
                style={styles.inputField}
                value={authPassword}
                onChangeText={(t) => setField('authPassword', t)}
                placeholder="At least 6 characters"
                placeholderTextColor={Colors.placeholder}
                secureTextEntry
              />
            </View>

            <View style={styles.inputCard}>
              <Text style={styles.inputLabel}>DATE OF BIRTH</Text>
              <TextInput
                style={styles.inputField}
                value={authDob}
                onChangeText={(t) => setField('authDob', t)}
                placeholder="DD / MM / YYYY"
                placeholderTextColor={Colors.placeholder}
              />
            </View>

            {/* Weight + Height side by side */}
            <View style={styles.sideRow}>
              <View style={[styles.inputCard, styles.flex]}>
                <Text style={[styles.inputLabel, styles.centerText]}>WEIGHT</Text>
                <View style={styles.unitRow}>
                  <TextInput
                    style={[styles.inputField, styles.unitInput]}
                    value={authWeight}
                    onChangeText={(t) => setField('authWeight', t)}
                    placeholder="70"
                    placeholderTextColor={Colors.placeholder}
                    keyboardType="numeric"
                  />
                  <Text style={styles.unitLabel}>kg</Text>
                </View>
              </View>
              <View style={[styles.inputCard, styles.flex]}>
                <Text style={[styles.inputLabel, styles.centerText]}>HEIGHT</Text>
                <View style={styles.unitRow}>
                  <TextInput
                    style={[styles.inputField, styles.unitInput]}
                    value={authHeight}
                    onChangeText={(t) => setField('authHeight', t)}
                    placeholder="175"
                    placeholderTextColor={Colors.placeholder}
                    keyboardType="numeric"
                  />
                  <Text style={styles.unitLabel}>cm</Text>
                </View>
              </View>
            </View>

            <View style={styles.inputCard}>
              <Text style={styles.inputLabel}>PHONE NUMBER</Text>
              <TextInput
                style={styles.inputField}
                value={authPhone}
                onChangeText={(t) => setField('authPhone', t)}
                placeholder="+33 6 ..."
                placeholderTextColor={Colors.placeholder}
                keyboardType="phone-pad"
              />
            </View>

            <TouchableOpacity
              style={[
                styles.primaryButton,
                signupCanSubmit
                  ? [styles.primaryActive, Shadows.button]
                  : styles.primaryDisabled,
              ]}
              activeOpacity={signupCanSubmit && !isSubmitting ? 0.7 : 1}
              onPress={signupCanSubmit && !isSubmitting ? handleSubmit : undefined}
            >
              <Text
                style={[
                  styles.primaryButtonText,
                  !signupCanSubmit && styles.primaryButtonTextDisabled,
                ]}
              >
                {isSubmitting ? 'Creating account...' : 'Create account'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() =>
                dispatch({ type: 'SET_AUTH_MODE', payload: 'email' })
              }
            >
              <Text style={styles.toggleLink}>
                Already have an account? Sign in
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() =>
                dispatch({ type: 'SET_AUTH_MODE', payload: 'choose' })
              }
            >
              <Text style={styles.backLink}>All sign-in options</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Spacer + Footer */}
        <View style={styles.flex} />
        <Text style={styles.footer}>
          By continuing you agree to Healthbar's Terms & Privacy Policy.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },

  // Brand
  brandBlock: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 30,
  },
  logoTile: {
    width: 62,
    height: 62,
    borderRadius: 19,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 18,
  },
  logoBars: {
    flexDirection: 'row',
    gap: 5,
    alignItems: 'flex-end',
  },
  bar: {
    width: 5,
    backgroundColor: '#fff',
    borderRadius: 3,
  },
  title: {
    fontSize: 27,
    fontWeight: '700',
    color: Colors.ink,
    letterSpacing: -0.54,
    marginTop: 18,
  },
  subtitle: {
    fontSize: 14.5,
    fontWeight: '500',
    color: Colors.muted,
    marginTop: 6,
  },

  // Error banner
  errorBanner: {
    backgroundColor: 'rgba(200,72,60,0.1)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 13.5,
    fontWeight: '500',
    color: '#C8483C',
    textAlign: 'center',
  },

  // Form group
  formGroup: {
    gap: 11,
  },

  // Social buttons
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: Colors.card,
    borderRadius: 15,
    padding: 15,
  },
  googleButtonText: {
    color: Colors.ink,
    fontSize: 15.5,
    fontWeight: '600',
  },

  // Divider
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  dividerText: {
    fontSize: 12.5,
    fontWeight: '500',
    color: Colors.muted,
  },

  // Email button
  emailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: Colors.accent,
    borderRadius: 15,
    padding: 15,
  },
  emailButtonText: {
    color: '#fff',
    fontSize: 15.5,
    fontWeight: '600',
  },

  // Switch / toggle links
  switchLink: {
    textAlign: 'center',
    paddingTop: 24,
    paddingBottom: 8,
    fontSize: 14.5,
    fontWeight: '600',
    color: Colors.accent,
  },
  toggleLink: {
    textAlign: 'center',
    paddingTop: 22,
    paddingBottom: 8,
    fontSize: 14.5,
    fontWeight: '600',
    color: Colors.accent,
  },
  backLink: {
    textAlign: 'center',
    paddingTop: 2,
    paddingBottom: 8,
    fontSize: 14,
    fontWeight: '500',
    color: Colors.muted,
  },

  // Input cards
  inputCard: {
    backgroundColor: Colors.card,
    borderRadius: 15,
    padding: 14,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  inputLabel: {
    fontSize: 11.5,
    fontWeight: '600',
    letterSpacing: 0.58,
    textTransform: 'uppercase',
    color: Colors.muted,
  },
  inputField: {
    marginTop: 5,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.ink,
    padding: 0,
  },

  // Username
  usernameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 5,
  },
  atSymbol: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.muted,
  },

  // Forgot
  forgotRow: {
    alignItems: 'flex-end',
    paddingTop: 2,
    paddingRight: 2,
  },
  forgotText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.accent,
  },

  // Primary button
  primaryButton: {
    marginTop: 6,
    borderRadius: 15,
    padding: 16,
    alignItems: 'center',
  },
  primaryActive: {
    backgroundColor: Colors.accent,
  },
  primaryDisabled: {
    backgroundColor: 'rgba(46,140,158,0.12)',
  },
  primaryButtonText: {
    fontSize: 15.5,
    fontWeight: '600',
    color: '#fff',
  },
  primaryButtonTextDisabled: {
    color: Colors.muted,
  },

  // Side row (weight/height)
  sideRow: {
    flexDirection: 'row',
    gap: 11,
  },
  centerText: {
    textAlign: 'center',
  },
  unitRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: 4,
    marginTop: 5,
  },
  unitInput: {
    width: 54,
    textAlign: 'right',
    marginTop: 0,
  },
  unitLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.muted,
  },

  // Footer
  footer: {
    textAlign: 'center',
    fontSize: 11.5,
    fontWeight: '500',
    color: Colors.muted,
    lineHeight: 17,
    paddingHorizontal: 6,
    paddingTop: 18,
  },
});
