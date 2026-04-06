import { useState, useCallback } from 'react'

interface UseCalculatorOptions<TInput, TResult> {
  initialInputs: TInput
  calculate: (inputs: TInput) => TResult | null
  validate?: (inputs: TInput) => string | null
}

export default function useCalculator<TInput, TResult>({
  initialInputs,
  calculate,
  validate,
}: UseCalculatorOptions<TInput, TResult>) {
  const [inputs, setInputs] = useState<TInput>(initialInputs)
  const [result, setResult] = useState<TResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const updateInput = useCallback(
    <K extends keyof TInput>(key: K, value: TInput[K]) => {
      setInputs((prev) => ({ ...prev, [key]: value }))
    },
    [],
  )

  const run = useCallback(() => {
    setError(null)
    if (validate) {
      const validationError = validate(inputs)
      if (validationError) {
        setError(validationError)
        setResult(null)
        return
      }
    }
    const output = calculate(inputs)
    setResult(output)
  }, [inputs, calculate, validate])

  const clear = useCallback(() => {
    setInputs(initialInputs)
    setResult(null)
    setError(null)
  }, [initialInputs])

  return { inputs, result, error, updateInput, run, clear }
}
