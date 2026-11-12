import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import CampusMap from '@/components/campus-map';
import Progress from '@/components/progress/progress';
import { getExploredPercent, type ClearedArea } from '@/utilities/explored';
import PlusButton from '@/components/buttons';
import CrownButton from '@/components/leaderboard';
import LocationButton from '@/components/location';
import { mapStyles } from '@/components/mapStyles';
import ProfileButton from '@/components/profile';
import { useEffect } from 'react';
import { startLocation, stopLocation } from '@/location';

import { useAuth, useSignUp } from '@clerk/expo'

export default function HomeScreen() {
  const { isLoaded, isSignedIn } = useAuth()
  const {signUp} = useSignUp()

  const [emailAddress, setEmailAddress] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)

  const handleSignUp = async () => {
    try {
      const { error } = await signUp.password({ emailAddress, password })
      if (error) {
        console.log(error)
        return
      }

      const { error: sendError } = await signUp.verifications.sendEmailCode()
      if (sendError) {
        console.log(sendError)
        return
      }
      setIsVerifying(true)
    } catch (error) {
      console.log(error)
    }
  }

  const handleVerify = async () => {
    try {
      const { error } = await signUp.verifications.verifyEmailCode({ code })
      if (error) {
        console.log(error)
        return
      }

      if (signUp.status !== 'complete') {
        console.log(signUp.status)
        return
      }

      const { error: finalizeError } = await signUp.finalize()
      if (finalizeError) {
        console.log(finalizeError)
      }
    } catch (error) {
      console.log(error)
    }
  }
  
  const insets = useSafeAreaInsets();

  const [cleared, setCleared] = useState<ClearedArea>(null);

  const percent = useMemo(() => getExploredPercent(cleared), [cleared]);

  useEffect(() => {
    startLocation();
    return () => stopLocation();
  }, []);

  if (isLoaded && !isSignedIn) {
    return (
      <View style={styles.auth}>
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          placeholder="Email"
          style={styles.input}
          value={emailAddress}
          onChangeText={setEmailAddress}
        />
        <TextInput
          placeholder="Password"
          secureTextEntry
          style={styles.input}
          value={password}
          onChangeText={setPassword}
        />
        {isVerifying ? (
          <>
            <TextInput
              autoCapitalize="none"
              keyboardType="number-pad"
              placeholder="Email code"
              style={styles.input}
              value={code}
              onChangeText={setCode}
            />
            <Pressable style={styles.authButton} onPress={handleVerify}>
              <Text style={styles.authButtonText}>Verify</Text>
            </Pressable>
          </>
        ) : (
          <Pressable style={styles.authButton} onPress={handleSignUp}>
            <Text style={styles.authButtonText}>Sign up</Text>
          </Pressable>
        )}
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <CampusMap cleared={cleared} />

      <Progress
        percent={percent}
        style={[styles.progress, { top: insets.top + 8 }]}
      />

      <View style={mapStyles.topButtons}>
        <ProfileButton />
        <LocationButton />
        <CrownButton />
      </View>

      <View style={mapStyles.bottomButton}>
        <PlusButton />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  progress: {
    position: 'absolute',
    left: 16,
  },
  auth: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  authButton: {
    backgroundColor: '#208AEF',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  authButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
